import { Repository } from 'typeorm';
import { MiniGame, MiniGameType } from './entities/mini-game.entity';
import { StoryNode } from './entities/story-node.entity';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
export declare class MiniGameService {
    private miniGameRepository;
    private storyNodeRepository;
    private gameSessionRepository;
    private characterRepository;
    constructor(miniGameRepository: Repository<MiniGame>, storyNodeRepository: Repository<StoryNode>, gameSessionRepository: Repository<GameSession>, characterRepository: Repository<Character>);
    createMiniGame(createMiniGameDto: {
        name: string;
        description: string;
        type: MiniGameType;
        difficulty: number;
        mandatory: boolean;
        completionNodeId?: string;
        failureNodeId?: string;
        rewards?: {
            experience?: number;
            gold?: number;
            items?: {
                id: string;
                name: string;
                quantity: number;
            }[];
            skills?: {
                id: string;
                experience: number;
            }[];
            traits?: Record<string, number>;
        };
        config: Record<string, any>;
    }): Promise<MiniGame>;
    getMiniGame(id: string): Promise<MiniGame>;
    deleteMiniGame(id: string): Promise<void>;
    updateMiniGame(id: string, updateMiniGameDto: Partial<{
        name: string;
        description: string;
        difficulty: number;
        mandatory: boolean;
        completionNodeId: string;
        failureNodeId: string;
        rewards: {
            experience?: number;
            gold?: number;
            items?: {
                id: string;
                name: string;
                quantity: number;
            }[];
            skills?: {
                id: string;
                experience: number;
            }[];
            traits?: Record<string, number>;
        };
        config: Record<string, any>;
    }>): Promise<MiniGame>;
    handleMiniGameResult(miniGameId: string, gameSessionId: string, success: boolean, score?: number): Promise<{
        nextNodeId: string;
        rewards?: any;
    }>;
    private handleLevelUp;
    private handleSkillLevelUp;
}
