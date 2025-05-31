import { GameSession } from './game-session.entity';
import { Choice } from './choice.entity';
export declare class StoryNode {
    id: string;
    content: string;
    location: string;
    sceneDescription: string;
    isCombatScene: boolean;
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
    gameSession: GameSession;
    choices: Choice[];
}
