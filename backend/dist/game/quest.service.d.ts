import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Quest, QuestStatus } from './entities/quest.entity';
import { GameSession } from './entities/game-session.entity';
import { MemoryService } from '../memory/memory.service';
export declare class QuestService {
    private questRepository;
    private gameSessionRepository;
    private memoryService;
    private configService;
    private readonly logger;
    private geminiAi;
    private generationModel;
    constructor(questRepository: Repository<Quest>, gameSessionRepository: Repository<GameSession>, memoryService: MemoryService, configService: ConfigService);
    generateQuest(gameSessionId: string, trigger: string, triggerType?: 'item' | 'location' | 'npc' | 'event'): Promise<Quest>;
    getQuestsByGameSession(gameSessionId: string): Promise<Quest[]>;
    getQuestById(id: string): Promise<Quest>;
    updateQuestStatus(id: string, status: QuestStatus): Promise<Quest>;
}
