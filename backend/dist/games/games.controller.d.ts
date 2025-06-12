import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    create(req: any, createGameDto: CreateGameDto): Promise<Game>;
}
