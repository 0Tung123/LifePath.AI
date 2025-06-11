import { MiniGameService } from './mini-game.service';
import { MiniGame, MiniGameType } from './entities/mini-game.entity';
export declare class MiniGameController {
    private readonly miniGameService;
    constructor(miniGameService: MiniGameService);
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
    deleteMiniGame(id: string): Promise<{
        message: string;
    }>;
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
    handleMiniGameResult(id: string, resultDto: {
        gameSessionId: string;
        success: boolean;
        score?: number;
    }): Promise<{
        nextNodeId: string;
        rewards?: any;
    }>;
}
