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
    private buildInitialPrompt;
    private parseAiResponse;
}
