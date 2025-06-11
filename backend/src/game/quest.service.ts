import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Quest, QuestStatus, QuestType } from './entities/quest.entity';
import { GameSession } from './entities/game-session.entity';
import { MemoryService } from '../memory/memory.service';
import { MemoryType } from '../memory/entities/memory-record.entity';

@Injectable()
export class QuestService {
  private readonly logger = new Logger(QuestService.name);
  private geminiAi: any;
  private generationModel: any;

  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
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
      model: 'gemini-2.0-flash',
    });
  }

  async generateQuest(
    gameSessionId: string,
    trigger: string,
    triggerType: 'item' | 'location' | 'npc' | 'event' = 'event',
  ): Promise<Quest> {
    try {
      const gameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSessionId },
        relations: ['character'],
      });

      if (!gameSession) {
        throw new Error(`Game session with id ${gameSessionId} not found`);
      }

      // Lấy bối cảnh từ bộ nhớ
      const memories = await this.memoryService.findRelevantMemories(
        trigger,
        gameSession.character.id,
        5,
      );

      let memoryContext = '';
      if (memories.length > 0) {
        memoryContext = 'Thông tin liên quan từ bộ nhớ:\n';
        memories.forEach((memory) => {
          memoryContext += `- ${memory.title}: ${memory.content}\n`;
        });
      }

      const prompt = `
Hãy tạo một nhiệm vụ phụ dựa trên yếu tố kích hoạt sau. Nhiệm vụ cần phù hợp với thể loại của game và bối cảnh thế giới.

Thông tin về nhân vật:
Tên: ${gameSession.character.name}
Lớp nhân vật: ${gameSession.character.characterClass}
Thể loại: ${gameSession.character.primaryGenre}
Thể loại game: ${gameSession.character.primaryGenre}
${gameSession.character.backstory ? `Tiểu sử: ${gameSession.character.backstory}` : ''}

Yếu tố kích hoạt: ${trigger} (Loại: ${triggerType})

${memoryContext}

Hãy trả về kết quả theo định dạng JSON:
{
  "title": "Tên nhiệm vụ ngắn gọn, hấp dẫn",
  "description": "Mô tả chi tiết về nhiệm vụ, bối cảnh và mục tiêu",
  "completionCriteria": "Điều kiện để hoàn thành nhiệm vụ",
  "rewards": {
    "experience": số điểm kinh nghiệm,
    "gold": số vàng,
    "items": ["tên vật phẩm 1", "tên vật phẩm 2"],
    "other": "phần thưởng khác (nếu có)"
  },
  "relatedNpcs": ["tên nhân vật liên quan"],
  "relatedLocations": ["tên địa điểm liên quan"]
}
`;

      const result = await this.generationModel.generateContent(prompt);
      const textResult = result.response.text();

      // Tìm và parse phần JSON từ kết quả
      const jsonMatch = textResult.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('Could not parse quest JSON from AI response');
      }

      const questData = JSON.parse(jsonMatch[0]);

      // Tạo nhiệm vụ mới
      const newQuest = this.questRepository.create({
        title: questData.title,
        description: questData.description,
        completionCriteria: questData.completionCriteria,
        status: QuestStatus.AVAILABLE,
        type: QuestType.DYNAMIC,
        characterId: gameSession.character.id,
        gameSessionId: gameSession.id,
        rewards: questData.rewards,
        triggers: [trigger],
        relatedNpcs: questData.relatedNpcs || [],
        relatedLocations: questData.relatedLocations || [],
        relatedItems: [],
      });

      const savedQuest = await this.questRepository.save(newQuest);

      // Lưu nhiệm vụ vào bộ nhớ
      await this.memoryService.createMemory({
        title: `Nhiệm vụ mới: ${savedQuest.title}`,
        content: savedQuest.description,
        type: MemoryType.QUEST,
        characterId: gameSession.character.id,
        gameSessionId: gameSession.id,
        importance: 0.8,
      });

      return savedQuest;
    } catch (error) {
      this.logger.error(`Error generating quest: ${error.message}`);
      throw error;
    }
  }

  async getQuestsByGameSession(gameSessionId: string): Promise<Quest[]> {
    return this.questRepository.find({
      where: { gameSessionId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getQuestById(id: string): Promise<Quest> {
    const quest = await this.questRepository.findOne({
      where: { id },
    });

    if (!quest) {
      throw new Error(`Quest with id ${id} not found`);
    }

    return quest;
  }

  async updateQuestStatus(id: string, status: QuestStatus): Promise<Quest> {
    const quest = await this.questRepository.findOne({
      where: { id },
    });

    if (!quest) {
      throw new Error(`Quest with id ${id} not found`);
    }

    quest.status = status;
    return this.questRepository.save(quest);
  }
}
