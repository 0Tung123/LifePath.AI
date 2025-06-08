import { Character } from './character.entity';
import { GameSession } from './game-session.entity';
export declare class CharacterDeath {
    id: string;
    characterId: string;
    character: Character;
    gameSessionId: string;
    gameSession: GameSession;
    deathDescription: string;
    deathCause: string;
    lastNodeId: string;
    lastDecision: string;
    stats: {
        level: number;
        daysSurvived: number;
        questsCompleted: number;
        significantChoices: number;
    };
    lastWords: string[];
    timestamp: Date;
}
