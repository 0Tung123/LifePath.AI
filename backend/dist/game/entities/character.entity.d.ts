import { User } from '../../user/entities/user.entity';
import { GameSession } from './game-session.entity';
import { SurvivalStats, CharacterRelationship, CharacterInventory, SpecialAbility } from '../interfaces/character-stats.interface';
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
    specialAbilities: SpecialAbility[];
    inventory: CharacterInventory;
    level: number;
    experience: number;
    backstory: string;
    relationships: CharacterRelationship[];
    createdAt: Date;
    updatedAt: Date;
    isDead: boolean;
    deathDate: Date;
    epitaph: string;
    legacyId: string;
    survivalStats: SurvivalStats;
    user: User;
    gameSessions: GameSession[];
}
