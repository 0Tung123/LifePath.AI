// Game engine types - complete and strict typing
export interface GameStats {
  readonly [key: string]: string | number;
}

export interface InventoryItem {
  readonly name: string;
  readonly description?: string;
  readonly quantity: number;
  readonly type?: string;
  readonly rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface CharacterSkill {
  readonly name: string;
  readonly description?: string;
  readonly level?: number;
  readonly mastery?: string;
  readonly type?: string;
  readonly requirements?: string[];
}

export interface LoreFragment {
  readonly title: string;
  readonly content: string;
  readonly type: string;
  readonly category: 'npc' | 'location' | 'item' | 'event' | 'world';
  readonly importance: 'low' | 'medium' | 'high';
  readonly timestamp: Date;
}

export interface GameChoice {
  readonly text: string;
  readonly number: number;
  readonly consequences?: string[];
  readonly requirements?: Record<string, number | string>;
}

export interface StoryHistoryEntry {
  readonly type:
    | 'story'
    | 'user_choice'
    | 'user_custom_action'
    | 'user_thinking'
    | 'user_communication';
  readonly content: string;
  readonly timestamp: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface KarmaChange {
  readonly amount: number;
  readonly reason: string;
  readonly timestamp: Date;
}

export interface ReputationChanges {
  readonly [group: string]: number;
}

export interface GameSettings {
  readonly characterName: string;
  readonly background: string;
  readonly world: string;
  readonly difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  readonly gameMode: 'story' | 'survival' | 'adventure' | 'sandbox';
  readonly customPrompt?: string;
  readonly enableKarma?: boolean;
  readonly enableReputation?: boolean;
  readonly language?: 'vi' | 'en';
}

export interface ParsedGameContent {
  readonly storyText: string;
  readonly choices: GameChoice[];
  readonly stats: GameStats;
  readonly inventory: InventoryItem[];
  readonly skills: CharacterSkill[];
  readonly lore: LoreFragment[];
  readonly karmaChange?: number;
  readonly karmaReason?: string;
  readonly reputationChanges?: ReputationChanges;
  readonly achievements?: string[];
  readonly events?: string[];
}

export interface GameAction {
  readonly type: 'choice' | 'custom' | 'think' | 'communicate';
  readonly choiceNumber?: number;
  readonly customAction?: string;
  readonly thought?: string;
  readonly communication?: string;
  readonly timestamp: Date;
}

export interface GameState {
  readonly id: string;
  readonly userId: string;
  readonly settings: GameSettings;
  readonly characterStats: GameStats;
  readonly inventoryItems: InventoryItem[];
  readonly characterSkills: CharacterSkill[];
  readonly loreFragments: LoreFragment[];
  readonly storyHistory: StoryHistoryEntry[];
  readonly currentPrompt: string;
  readonly currentChoices: GameChoice[];
  readonly karmaScore: number;
  readonly reputation: ReputationChanges;
  readonly active: boolean;
  readonly deathDate: Date | null;
  readonly deathCause: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface GameCreationResult {
  readonly game: GameState;
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
}

export interface GameActionResult {
  readonly game: GameState;
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
  readonly isGameOver?: boolean;
}

export interface LifeSummary {
  readonly totalDays: number;
  readonly majorEvents: string[];
  readonly finalStats: GameStats;
  readonly achievements: string[];
  readonly karmaScore: number;
  readonly reputation: ReputationChanges;
  readonly deathCause: string | null;
  readonly legacy: string;
}

export interface ResurrectionOptions {
  readonly available: boolean;
  readonly skillName?: string;
  readonly cost?: string;
  readonly penalty?: string;
  readonly description?: string;
}

export interface GameMetrics {
  readonly totalGames: number;
  readonly activeGames: number;
  readonly completedGames: number;
  readonly averageSessionLength: number;
  readonly popularChoices: Array<{
    readonly text: string;
    readonly count: number;
  }>;
}

export interface AIPromptContext {
  readonly gameSettings: GameSettings;
  readonly currentStats: GameStats;
  readonly recentHistory: StoryHistoryEntry[];
  readonly playerAction: GameAction;
  readonly worldState: string;
  readonly characterBackground: string;
}
