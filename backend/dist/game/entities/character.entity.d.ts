import { User } from '../../user/entities/user.entity';
import { GameSession } from './game-session.entity';
export declare enum GameGenre {
    FANTASY = "fantasy",
    MODERN = "modern",
    SCIFI = "scifi",
    XIANXIA = "xianxia",
    WUXIA = "wuxia",
    HORROR = "horror",
    CYBERPUNK = "cyberpunk",
    STEAMPUNK = "steampunk",
    POSTAPOCALYPTIC = "postapocalyptic",
    HISTORICAL = "historical"
}
export interface CharacterAttributes {
    strength: number;
    intelligence: number;
    dexterity: number;
    charisma: number;
    health: number;
    mana: number;
    cultivation?: number;
    qi?: number;
    perception?: number;
    tech?: number;
    hacking?: number;
    piloting?: number;
    sanity?: number;
    willpower?: number;
    education?: number;
    wealth?: number;
    influence?: number;
    [key: string]: number | undefined;
}
export declare class Character {
    id: string;
    name: string;
    characterClass: string;
    primaryGenre: GameGenre;
    secondaryGenres: GameGenre[];
    customGenreDescription: string;
    attributes: CharacterAttributes;
    skills: string[];
    specialAbilities: {
        name: string;
        description: string;
        cooldown?: number;
        cost?: {
            type: string;
            amount: number;
        };
    }[];
    inventory: {
        items: {
            id: string;
            name: string;
            description: string;
            quantity: number;
            type?: string;
            effects?: Record<string, any>;
            value?: number;
            rarity?: string;
        }[];
        currency: {
            gold?: number;
            credits?: number;
            yuan?: number;
            spirit_stones?: number;
            [key: string]: number | undefined;
        };
    };
    level: number;
    experience: number;
    backstory: string;
    relationships: {
        npcId: string;
        name: string;
        relation: number;
        type: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    isDead: boolean;
    deathDate: Date;
    epitaph: string;
    legacyId: string;
    survivalStats: {
        daysSurvived: number;
        dangerousSituationsOvercome: number;
        nearDeathExperiences: number;
        majorDecisionsMade: number;
    };
    user: User;
    gameSessions: GameSession[];
}
