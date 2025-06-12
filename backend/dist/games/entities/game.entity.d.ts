import { User } from '../../user/entities/user.entity';
import { GameSettingsDto } from '../dto/create-game.dto';
import { GameStats, InventoryItem, Skill, LoreFragment, Choice } from '../interfaces/game-content.interface';
interface StorySegment {
    text: string;
    timestamp: Date;
}
export declare class Game {
    id: string;
    userId: string;
    user: User;
    settings: GameSettingsDto;
    storyHistory: StorySegment[];
    characterStats: GameStats;
    inventoryItems: InventoryItem[];
    characterSkills: Skill[];
    loreFragments: LoreFragment[];
    currentPrompt: string;
    currentChoices: Choice[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export {};
