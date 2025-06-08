import { Character } from './character.entity';
import { GameSession } from './game-session.entity';
export declare enum ConsequenceSeverity {
    MINOR = "minor",
    MODERATE = "moderate",
    MAJOR = "major",
    CRITICAL = "critical"
}
export declare class Consequence {
    id: string;
    gameSessionId: string;
    gameSession: GameSession;
    characterId: string;
    character: Character;
    description: string;
    triggerTime: Date;
    severity: ConsequenceSeverity;
    isPermanent: boolean;
    affectedEntities: string[];
    isTriggered: boolean;
    sourceActionId: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
