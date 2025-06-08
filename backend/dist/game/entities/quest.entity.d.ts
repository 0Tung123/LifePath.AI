import { Character } from './character.entity';
import { GameSession } from './game-session.entity';
export declare enum QuestStatus {
    AVAILABLE = "available",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum QuestType {
    MAIN = "main",
    SIDE = "side",
    DYNAMIC = "dynamic",
    HIDDEN = "hidden"
}
export declare class Quest {
    id: string;
    title: string;
    description: string;
    completionCriteria: string;
    status: QuestStatus;
    type: QuestType;
    characterId: string;
    character: Character;
    gameSessionId: string;
    gameSession: GameSession;
    rewards: {
        experience?: number;
        gold?: number;
        items?: string[];
        other?: string;
    };
    triggers: string[];
    relatedItems: string[];
    relatedLocations: string[];
    relatedNpcs: string[];
    createdAt: Date;
    updatedAt: Date;
}
