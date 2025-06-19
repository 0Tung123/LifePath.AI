import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { GeminiService } from './gemini.service';
export declare class GamesService {
    private gamesRepository;
    private geminiService;
    private readonly logger;
    constructor(gamesRepository: Repository<Game>, geminiService: GeminiService);
    create(userId: string, createGameDto: CreateGameDto): Promise<Game>;
    findAllByUser(userId: string): Promise<Game[]>;
    findOne(id: string, userId: string): Promise<Game>;
    remove(id: string, userId: string): Promise<void>;
    processAction(id: string, userId: string, choiceNumber?: number, action?: string, think?: string, communication?: string): Promise<Game>;
    private buildActionPrompt;
    private buildInitialPrompt;
    private parseAiResponse;
    private checkIfCharacterIsDead;
    private checkForResurrectionItems;
    private extractDeathCause;
    private handleResurrection;
    generateLifeSummary(gameId: string): Promise<any>;
    resurrectCharacter(gameId: string, userId: string): Promise<Game>;
}
