import { User } from '../../user/entities/user.entity';
import { GameSettingsDto } from '../dto/create-game.dto';
import { GameStats, InventoryItem, Skill, LoreFragment, Choice } from '../interfaces/game-content.interface';
interface StorySegment {
    type: 'story' | 'user_choice' | 'user_custom_action' | 'user_thinking' | 'user_communication' | 'system';
    content: string;
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
    chatHistoryForGemini: any[];
    knowledgeBase: any[];
    currentObjective: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export {};
