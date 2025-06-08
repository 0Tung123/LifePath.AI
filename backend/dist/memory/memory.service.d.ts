import { Repository } from 'typeorm';
import { MemoryRecord, MemoryType } from './entities/memory-record.entity';
import { ConfigService } from '@nestjs/config';
export declare class MemoryService {
    private memoryRepository;
    private configService;
    private readonly logger;
    private geminiAi;
    private embeddingModel;
    constructor(memoryRepository: Repository<MemoryRecord>, configService: ConfigService);
    createEmbedding(text: string): Promise<number[]>;
    createMemory(data: {
        title: string;
        content: string;
        type: MemoryType;
        characterId?: string;
        gameSessionId?: string;
        tags?: string[];
        importance?: number;
    }): Promise<MemoryRecord>;
    findRelevantMemories(context: string, characterId?: string, limit?: number): Promise<MemoryRecord[]>;
    createPromptWithMemories(basePrompt: string, context: string, characterId?: string): Promise<string>;
}
