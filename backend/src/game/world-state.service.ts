import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { MemoryService } from '../memory/memory.service';
import { MemoryType } from '../memory/entities/memory-record.entity';

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

      const worldContext = `
Nhân vật: ${character.name}, ${character.characterClass}
Thế giới: ${character.primaryGenre}
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
    "importance": số từ 0.1 đến 1.0 thể hiện mức độ quan trọng
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
        await this.memoryService.createMemory({
          title: event.title,
          content: event.content,
          type: MemoryType.EVENT,
          characterId: character.id,
          gameSessionId: session.id,
          importance: event.importance || 0.5,
        });
      }

      this.logger.log(
        `Generated ${events.length} events for session ${session.id}`,
      );
    } catch (error) {
      this.logger.error(`Error generating world events: ${error.message}`);
    }
  }
}
