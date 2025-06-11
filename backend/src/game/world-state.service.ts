import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameSession, WorldLocation, WorldNPC, WorldFaction } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { MemoryService } from '../memory/memory.service';
import { MemoryType } from '../memory/entities/memory-record.entity';
import { TimeOfDay, Season } from './entities/story-node.entity';

@Injectable()
export class WorldStateService {
  private readonly logger = new Logger(WorldStateService.name);
  private geminiAi: any;
  private generationModel: any;

  constructor(
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private memoryService: MemoryService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set');
      return;
    }

    this.geminiAi = new GoogleGenerativeAI(apiKey);
    this.generationModel = this.geminiAi.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateWorldState() {
    this.logger.log('Updating world state...');

    try {
      // Lấy tất cả phiên game đang active
      const activeSessions = await this.gameSessionRepository.find({
        where: { isActive: true },
        relations: ['character'],
      });

      for (const session of activeSessions) {
        // Kiểm tra thời gian kể từ lần cuối người chơi tương tác
        const lastActivity = session.updatedAt;
        const now = new Date();
        const hoursSinceLastActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60),
        );

        // Chỉ cập nhật thế giới nếu người chơi không hoạt động ít nhất 3 giờ
        if (hoursSinceLastActivity >= 3) {
          await this.generateWorldEvents(session);
        }
      }
    } catch (error) {
      this.logger.error(`Error updating world state: ${error.message}`);
    }
  }

  async generateWorldEvents(session: GameSession) {
    try {
      const character = session.character;

      // Lấy các bản ghi bộ nhớ hiện có cho phiên này
      const existingMemories = await this.memoryService.findRelevantMemories(
        '',
        character.id,
        10,
      );

      let memoriesContext = '';
      if (existingMemories.length > 0) {
        memoriesContext = 'Các sự kiện đã xảy ra trước đó:\n';
        existingMemories.forEach((memory) => {
          memoriesContext += `- ${memory.title}: ${memory.content}\n`;
        });
      }

      // Thêm thông tin về thời gian trong ngày và mùa hiện tại
      const worldContext = `
Nhân vật: ${character.name}, ${character.characterClass}
Thế giới: ${character.primaryGenre}
Thời gian trong ngày: ${session.timeOfDay || 'MORNING'}
Mùa: ${session.season || 'SPRING'}
Ngày trong mùa: ${session.seasonDay || 1}
Thời gian kể từ hoạt động cuối: ${Math.floor(
        (new Date().getTime() - session.updatedAt.getTime()) / (1000 * 60 * 60),
      )} giờ
${memoriesContext}
      `;

      const prompt = `
Hãy tạo ra 1-3 sự kiện đã xảy ra trong thế giới game trong khoảng thời gian người chơi vắng mặt.
Những sự kiện này nên liên quan đến bối cảnh thế giới, các phe phái hoặc NPC đã xuất hiện trước đó.
Hãy trả về kết quả theo format JSON:
[
  {
    "title": "Tên sự kiện ngắn gọn",
    "content": "Mô tả chi tiết về sự kiện",
    "importance": số từ 0.1 đến 1.0 thể hiện mức độ quan trọng,
    "affectedLocationId": "ID của địa điểm bị ảnh hưởng (nếu có)",
    "affectedFactionId": "ID của phe phái bị ảnh hưởng (nếu có)"
  }
]

Thông tin về nhân vật và thế giới:
${worldContext}
`;

      const result = await this.generationModel.generateContent(prompt);
      const textResult = result.response.text();

      interface WorldEvent {
        title: string;
        content: string;
        importance: number;
        affectedLocationId?: string;
        affectedFactionId?: string;
      }

      let events: WorldEvent[] = [];
      try {
        // Tìm và parse phần JSON từ kết quả
        const jsonMatch = textResult.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          events = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        this.logger.error(`Error parsing events JSON: ${error.message}`);
        return;
      }

      // Lưu các sự kiện vào bộ nhớ
      for (const event of events) {
        // Lưu sự kiện vào bộ nhớ
        await this.memoryService.createMemory({
          title: event.title,
          content: event.content,
          type: MemoryType.EVENT,
          characterId: character.id,
          gameSessionId: session.id,
          importance: event.importance || 0.5,
        });

        // Cập nhật địa điểm bị ảnh hưởng nếu có
        if (event.affectedLocationId && session.worldState?.locations) {
          const location = session.worldState.locations.find(
            l => l.id === event.affectedLocationId
          );
          if (location) {
            await this.updateLocationState(
              session.id,
              event.affectedLocationId,
              'affected_by_event',
              event.title
            );
          }
        }

        // Cập nhật danh tiếng phe phái nếu có
        if (event.affectedFactionId && session.worldState?.factions) {
          // Tính toán mức thay đổi danh tiếng dựa trên tầm quan trọng của sự kiện
          const reputationChange = Math.floor((Math.random() * 20) - 10); // -10 đến +10
          await this.updateFactionReputation(
            session.id,
            event.affectedFactionId,
            reputationChange
          );
        }
      }

      // Tự động tiến thời gian sau một thời gian dài không hoạt động
      await this.advanceTime(session);

      this.logger.log(
        `Generated ${events.length} events for session ${session.id}`,
      );
    } catch (error) {
      this.logger.error(`Error generating world events: ${error.message}`);
    }
  }

  // Tiến thời gian tự động dựa trên thời gian không hoạt động
  async advanceTime(session: GameSession) {
    try {
      const hoursSinceLastActivity = Math.floor(
        (new Date().getTime() - session.updatedAt.getTime()) / (1000 * 60 * 60),
      );

      // Thay đổi thời gian trong ngày
      if (hoursSinceLastActivity >= 6) {
        const timeOfDayValues = Object.values(TimeOfDay);
        const currentIndex = timeOfDayValues.indexOf(session.timeOfDay);
        const nextIndex = (currentIndex + 1) % timeOfDayValues.length;
        const newTimeOfDay = timeOfDayValues[nextIndex];
        
        await this.changeTimeOfDay(session.id, newTimeOfDay as TimeOfDay);
        
        // Nếu đã qua một ngày hoàn chỉnh, tăng ngày trong mùa
        if (newTimeOfDay === TimeOfDay.DAWN) {
          session.seasonDay += 1;
          
          // Kiểm tra chuyển mùa (giả sử mỗi mùa 30 ngày)
          if (session.seasonDay > 30) {
            const seasonValues = Object.values(Season);
            const currentSeasonIndex = seasonValues.indexOf(session.season);
            const nextSeasonIndex = (currentSeasonIndex + 1) % seasonValues.length;
            const newSeason = seasonValues[nextSeasonIndex];
            
            await this.changeSeason(session.id, newSeason as Season);
          } else {
            await this.gameSessionRepository.save(session);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error advancing time: ${error.message}`);
    }
  }

  // Thay đổi thời gian trong ngày
  async changeTimeOfDay(
    gameSessionId: string,
    newTimeOfDay: TimeOfDay,
  ): Promise<GameSession> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
    });

    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    const oldTimeOfDay = gameSession.timeOfDay;
    gameSession.timeOfDay = newTimeOfDay;

    // Cập nhật vị trí của NPC dựa trên lịch trình
    if (gameSession.worldState && gameSession.worldState.npcs) {
      for (const npc of gameSession.worldState.npcs) {
        if (npc.schedule && npc.schedule[newTimeOfDay]) {
          npc.currentLocationId = npc.schedule[newTimeOfDay].locationId;
        }
      }
    }

    // Ghi lại sự kiện chuyển đổi thời gian
    await this.memoryService.createMemory({
      title: `Thời gian chuyển sang ${newTimeOfDay}`,
      content: `Thời gian trong ngày đã chuyển từ ${oldTimeOfDay} sang ${newTimeOfDay}.`,
      type: MemoryType.WORLD_CHANGE,
      gameSessionId: gameSessionId,
      characterId: gameSession.character.id,
      importance: 0.3,
    });

    return this.gameSessionRepository.save(gameSession);
  }

  // Thay đổi mùa
  async changeSeason(
    gameSessionId: string,
    newSeason: Season,
  ): Promise<GameSession> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['character'],
    });

    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    const oldSeason = gameSession.season;
    gameSession.season = newSeason;
    gameSession.seasonDay = 1;

    // Ghi lại sự kiện chuyển mùa
    await this.memoryService.createMemory({
      title: `Mùa chuyển sang ${newSeason}`,
      content: `Mùa đã chuyển từ ${oldSeason} sang ${newSeason}. Cây cối và thời tiết đã thay đổi để phản ánh mùa mới.`,
      type: MemoryType.WORLD_CHANGE,
      gameSessionId: gameSessionId,
      characterId: gameSession.character.id,
      importance: 0.7,
    });

    return this.gameSessionRepository.save(gameSession);
  }

  // Cập nhật danh tiếng với phe phái
  async updateFactionReputation(
    gameSessionId: string,
    factionId: string,
    amount: number,
  ): Promise<{ faction: WorldFaction; newReputation: number }> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['character'],
    });

    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    if (!gameSession.worldState || !gameSession.worldState.factions) {
      throw new NotFoundException('World state or factions not initialized');
    }

    const faction = gameSession.worldState.factions.find(f => f.id === factionId);
    if (!faction) {
      throw new NotFoundException(`Faction with ID ${factionId} not found`);
    }

    // Cập nhật danh tiếng (giới hạn trong khoảng -100 đến 100)
    faction.reputation = Math.max(-100, Math.min(100, faction.reputation + amount));

    // Cập nhật quan hệ của NPC thuộc phe phái này
    if (gameSession.worldState.npcs) {
      for (const npc of gameSession.worldState.npcs) {
        if (npc.factionIds && npc.factionIds.includes(factionId)) {
          // Cập nhật danh tiếng NPC (chỉ thay đổi một phần so với phe phái)
          npc.reputation = Math.max(-100, Math.min(100, npc.reputation + amount / 2));
          
          // Cập nhật mối quan hệ dựa trên danh tiếng
          if (npc.reputation >= 75) {
            npc.relationship = 'allied';
          } else if (npc.reputation >= 25) {
            npc.relationship = 'friendly';
          } else if (npc.reputation >= -25) {
            npc.relationship = 'neutral';
          } else {
            npc.relationship = 'hostile';
          }
        }
      }
    }

    // Cập nhật danh tiếng phe phái trong hồ sơ nhân vật
    if (gameSession.character.factionReputations) {
      const charFactionRep = gameSession.character.factionReputations.find(
        fr => fr.factionId === factionId
      );
      
      if (charFactionRep) {
        charFactionRep.reputation = Math.max(-100, Math.min(100, charFactionRep.reputation + amount));
      } else {
        gameSession.character.factionReputations.push({
          factionId: factionId,
          factionName: faction.name,
          reputation: amount,
        });
      }
      
      await this.characterRepository.save(gameSession.character);
    }

    // Ghi lại sự kiện thay đổi danh tiếng
    const reputationChangeText = amount >= 0 ? 'tăng' : 'giảm';
    await this.memoryService.createMemory({
      title: `Danh tiếng với ${faction.name} ${reputationChangeText}`,
      content: `Danh tiếng của bạn với ${faction.name} đã ${reputationChangeText} ${Math.abs(amount)} điểm, hiện tại là ${faction.reputation}.`,
      type: MemoryType.REPUTATION,
      gameSessionId: gameSessionId,
      characterId: gameSession.character.id,
      importance: Math.abs(amount) / 20, // Đặt mức độ quan trọng dựa trên lượng thay đổi
    });

    await this.gameSessionRepository.save(gameSession);
    return { faction, newReputation: faction.reputation };
  }

  // Cập nhật trạng thái địa điểm
  async updateLocationState(
    gameSessionId: string,
    locationId: string,
    newState: string,
    reason: string,
  ): Promise<WorldLocation> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['character'],
    });

    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    if (!gameSession.worldState || !gameSession.worldState.locations) {
      throw new NotFoundException('World state or locations not initialized');
    }

    const location = gameSession.worldState.locations.find(l => l.id === locationId);
    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    // Lưu trạng thái thay đổi
    if (!gameSession.worldState.changedLocations) {
      gameSession.worldState.changedLocations = {};
    }
    
    gameSession.worldState.changedLocations[locationId] = {
      previousState: location.currentState,
      newState: newState,
      reason: reason,
      timestamp: new Date(),
    };

    // Cập nhật trạng thái
    const oldState = location.currentState;
    location.currentState = newState;

    // Ghi lại sự kiện thay đổi địa điểm
    await this.memoryService.createMemory({
      title: `${location.name} đã thay đổi`,
      content: `${location.name} đã thay đổi từ ${oldState} sang ${newState} vì: ${reason}`,
      type: MemoryType.LOCATION_CHANGE,
      gameSessionId: gameSessionId,
      characterId: gameSession.character.id,
      importance: 0.6,
    });

    await this.gameSessionRepository.save(gameSession);
    return location;
  }

  // Khởi tạo thế giới ban đầu
  async initializeWorldState(
    gameSessionId: string,
    worldData: {
      locations: WorldLocation[];
      npcs: WorldNPC[];
      factions: WorldFaction[];
    },
  ): Promise<GameSession> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
    });

    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    gameSession.worldState = {
      locations: worldData.locations,
      npcs: worldData.npcs,
      factions: worldData.factions,
      changedLocations: {},
    };

    return this.gameSessionRepository.save(gameSession);
  }

  // Lấy trạng thái thế giới hiện tại
  async getWorldState(gameSessionId: string): Promise<any> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
    });

    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    return {
      timeOfDay: gameSession.timeOfDay,
      season: gameSession.season,
      seasonDay: gameSession.seasonDay,
      worldState: gameSession.worldState,
    };
  }
}
