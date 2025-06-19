import { GameActionDto } from './dto/game-action.dto';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    create(req: any, createGameDto: CreateGameDto): Promise<Game>;
    findAll(req: any): Promise<Game[]>;
    findOne(id: string, req: any): Promise<Game>;
    remove(id: string, req: any): Promise<void>;
    processAction(id: string, req: any, actionDto: GameActionDto): Promise<Game>;
    getLifeSummary(id: string, req: any): Promise<any>;
    resurrectCharacter(id: string, req: any): Promise<Game>;
}
