import { Repository } from 'typeorm';
import { Character, GameGenre } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { StoryPath } from './entities/story-path.entity';
import { GeminiAiService } from './gemini-ai.service';
import { CharacterGeneratorService } from './character-generator.service';
import { User } from '../user/entities/user.entity';
export declare class GameService {
    private characterRepository;
    private gameSessionRepository;
    private storyNodeRepository;
    private choiceRepository;
    private storyPathRepository;
    private userRepository;
    private geminiAiService;
    private characterGeneratorService;
    private readonly logger;
    constructor(characterRepository: Repository<Character>, gameSessionRepository: Repository<GameSession>, storyNodeRepository: Repository<StoryNode>, choiceRepository: Repository<Choice>, storyPathRepository: Repository<StoryPath>, userRepository: Repository<User>, geminiAiService: GeminiAiService, characterGeneratorService: CharacterGeneratorService);
    createCharacter(userId: string, characterData: Partial<Character>): Promise<Character>;
    generateCharacterFromDescription(userId: string, description: string, primaryGenre?: GameGenre, secondaryGenres?: GameGenre[], customGenreDescription?: string): Promise<Character>;
    private getDefaultAttributes;
    private addGenreAttributes;
    private getDefaultInventory;
    private addGenreItems;
    private hasItemOfType;
    private getGenreCurrency;
    getCharactersByUserId(userId: string): Promise<Character[]>;
    getCharacterById(id: string): Promise<Character>;
    updateCharacter(id: string, updateData: Partial<Character>): Promise<Character>;
    startGameSession(characterId: string, initialPrompt?: string): Promise<GameSession>;
    getGameSessionWithDetails(sessionId: string): Promise<GameSession>;
    getActiveGameSessionForCharacter(characterId: string): Promise<GameSession>;
    makeChoice(sessionId: string, choiceId: string): Promise<GameSession>;
    goBackToNode(sessionId: string, nodeId: string): Promise<GameSession>;
    getStoryTree(sessionId: string): Promise<any>;
    endGameSession(sessionId: string): Promise<GameSession>;
    deleteGameSession(sessionId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteCharacter(characterId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getGameSessionHistory(sessionId: string): Promise<StoryNode[]>;
    getActualPathHistory(sessionId: string): Promise<{
        pathNodes: StoryNode[];
        allNodes: StoryNode[];
        currentPath: string[];
    }>;
    getAllBranches(sessionId: string): Promise<{
        activeBranch: any[];
        inactiveBranches: any[];
        branchPoints: any[];
    }>;
    restoreBranch(sessionId: string, branchId: string): Promise<GameSession>;
    getGameSessionsByCharacterId(characterId: string): Promise<GameSession[]>;
}
