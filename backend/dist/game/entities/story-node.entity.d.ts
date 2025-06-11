import { GameSession } from './game-session.entity';
import { Choice } from './choice.entity';
export declare enum TimeOfDay {
    DAWN = "dawn",
    MORNING = "morning",
    NOON = "noon",
    AFTERNOON = "afternoon",
    EVENING = "evening",
    NIGHT = "night",
    MIDNIGHT = "midnight"
}
export declare enum Season {
    SPRING = "spring",
    SUMMER = "summer",
    AUTUMN = "autumn",
    WINTER = "winter"
}
export declare enum BranchType {
    MAIN = "main",
    VARIANT = "variant",
    SIDE = "side"
}
export declare class StoryNode {
    id: string;
    content: string;
    location: string;
    sceneDescription: string;
    isCombatScene: boolean;
    isRoot: boolean;
    parentNodeId: string;
    gameSessionId: string;
    timeOfDay: TimeOfDay;
    season: Season;
    branchType: BranchType;
    requiredFlags: string[];
    requiredStats: Record<string, number>;
    statsEffects: Record<string, number>;
    metadata: {
        inputType?: string;
        userInput?: string;
        dangerLevel?: number;
        tags?: string[];
        mood?: string;
        weight?: number;
        bookmarkable?: boolean;
        [key: string]: any;
    };
    combatData: {
        enemies: {
            id: string;
            name: string;
            level: number;
            health: number;
            attributes: Record<string, number>;
            abilities: string[];
        }[];
        rewards: {
            experience: number;
            gold: number;
            items: {
                id: string;
                name: string;
                description?: string;
                quantity: number;
                dropChance: number;
                type?: string;
                value?: number;
                rarity?: string;
            }[];
        };
    };
    createdAt: Date;
    isEnding: boolean;
    endingType: string;
    gameSession: GameSession;
    choices: Choice[];
}
