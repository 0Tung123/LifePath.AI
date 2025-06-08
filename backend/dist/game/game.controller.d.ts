import { GameService } from './game.service';
import { Character, GameGenre } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    createCharacter(req: any, characterData: Partial<Character>): Promise<Character>;
    generateCharacter(req: any, data: {
        description: string;
        primaryGenre?: GameGenre;
        secondaryGenres?: GameGenre[];
        customGenreDescription?: string;
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
    getGameSessionHistory(id: string): Promise<import("./entities/story-node.entity").StoryNode[]>;
    getActualPathHistory(id: string): Promise<{
        pathNodes: import("./entities/story-node.entity").StoryNode[];
        allNodes: import("./entities/story-node.entity").StoryNode[];
        currentPath: string[];
    }>;
    getAllBranches(id: string): Promise<{
        activeBranch: any[];
        inactiveBranches: any[];
        branchPoints: any[];
    }>;
    restoreBranch(sessionId: string, branchId: string): Promise<GameSession>;
    saveGame(id: string): Promise<GameSession>;
    endGame(id: string): Promise<GameSession>;
    deleteGameSession(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteCharacter(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    makeChoice(id: string, choiceId: string): Promise<GameSession>;
    goBackToNode(sessionId: string, nodeId: string): Promise<GameSession>;
    getStoryTree(sessionId: string): Promise<any>;
}
