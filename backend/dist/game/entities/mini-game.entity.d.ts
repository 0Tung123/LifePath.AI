import { StoryNode } from './story-node.entity';
export declare enum MiniGameType {
    PUZZLE = "puzzle",
    REFLEX = "reflex",
    ASSEMBLY = "assembly"
}
export declare enum PuzzleType {
    LOGIC = "logic",
    WORD = "word",
    MATH = "math",
    PATTERN = "pattern"
}
export declare enum ReflexGameType {
    DODGE = "dodge",
    RHYTHM = "rhythm",
    REACTION = "reaction"
}
export declare class MiniGame {
    id: string;
    name: string;
    description: string;
    type: MiniGameType;
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
    completionNode: StoryNode;
    failureNode: StoryNode;
}
