import { GameService } from './game.service';
import { Character, GameGenre } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    createCharacter(req: any, characterData: Partial<Character>): Promise<Character>;
    generateCharacter(req: any, data: {
        description: string;
        genre?: GameGenre;
    }): Promise<Character>;
    getMyCharacters(req: any): Promise<Character[]>;
    getCharacter(id: string): Promise<Character>;
    getAvailableGenres(): Promise<{
        id: string;
        name: string;
        description: string;
    }[]>;
    startNewGame(data: {
        characterId: string;
    }): Promise<GameSession>;
    getMyActiveSessions(req: any): Promise<GameSession[]>;
    getGameSession(id: string): Promise<GameSession>;
    saveGame(id: string): Promise<GameSession>;
    endGame(id: string): Promise<GameSession>;
    makeChoice(id: string, choiceId: string): Promise<GameSession>;
}
