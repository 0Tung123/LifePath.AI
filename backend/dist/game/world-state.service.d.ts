import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { MemoryService } from '../memory/memory.service';
export declare class WorldStateService {
    private gameSessionRepository;
    private characterRepository;
    private memoryService;
    private configService;
    private readonly logger;
    private geminiAi;
    private generationModel;
    constructor(gameSessionRepository: Repository<GameSession>, characterRepository: Repository<Character>, memoryService: MemoryService, configService: ConfigService);
    updateWorldState(): Promise<void>;
    generateWorldEvents(session: GameSession): Promise<void>;
}
