// Game System Types - Sync with Backend
// Based on backend: Game entity, GameStats, InventoryItem, Skill, etc.

export interface GameStats {
  [key: string]: string | number;
}

export interface InventoryItem {
  name: string;
  description?: string;
  quantity: number;
}

export interface Skill {
  name: string;
  description?: string;
  level?: number;
  mastery?: string;
}

export interface LoreFragment {
  type: 'npc' | 'item' | 'location' | 'general';
  name?: string;
  title?: string;
  description?: string;
  content?: string;
  Name?: string;
  Description?: string;
  KnownAttributes?: string;
  HiddenAttributes?: string;
  Disposition?: string;
  Importance?: string;
  Type?: string;
  Location?: string;
  Occupation?: string;
  Age?: string;
  Gender?: string;
  Personality?: string;
  Background?: string;
  Motivation?: string;
  Secrets?: string;
  Connections?: string;
  [key: string]: string | undefined;
}

export interface Choice {
  text: string;
  number: number;
}

export interface NpcMet {
  name: string;
  description: string;
  firstMet: Date;
  interactions: number;
}

export interface ItemUsed {
  name: string;
  description: string;
  usedAt: Date;
  quantity: number;
}

export interface ImportantEvent {
  title: string;
  description: string;
  timestamp: Date;
  type: string;
}

export interface Achievement {
  name: string;
  description: string;
  unlockedAt: Date;
}

export interface StorySegment {
  type:
    | 'story'
    | 'user_choice'
    | 'user_custom_action'
    | 'user_thinking'
    | 'user_communication'
    | 'system';
  content: string;
  timestamp: Date;
}

// Game Settings
export interface AdditionalSettings {
  style?: string;
  difficulty?: string;
  gameLength?: string;
  combatStyle?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface GameSettingsDto {
  theme: string;
  setting: string;
  characterName: string;
  characterBackstory: string;
  additionalSettings?: AdditionalSettings;
}

export interface CreateGameDto {
  gameSettings: GameSettingsDto;
}

// Game Action
export interface GameActionDto {
  choiceNumber?: number;
  action?: string;
  think?: string;
  communication?: string;
}

// Game State
export interface GameState {
  id: string;
  userId: string;
  settings: GameSettingsDto;
  storyHistory: StorySegment[];
  characterStats: GameStats;
  inventoryItems: InventoryItem[];
  characterSkills: Skill[];
  loreFragments: LoreFragment[];
  currentPrompt?: string;
  currentChoices?: Choice[];
  currentObjective?: string;
  npcsMet?: NpcMet[];
  itemsUsed?: ItemUsed[];
  importantEvents?: ImportantEvent[];
  achievements?: Achievement[];
  karmaScore: number;
  reputation?: { [key: string]: number };
  active: boolean;
  deathDate?: Date;
  deathCause?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Parsed Game Content
export interface ParsedGameContent {
  storyText: string;
  stats: GameStats;
  inventory: InventoryItem[];
  skills: Skill[];
  lore: LoreFragment[];
  choices: Choice[];
  karmaChange?: number;
  karmaReason?: string;
  reputationChanges?: { [key: string]: number };
  npcsMet?: NpcMet[];
  itemsUsed?: ItemUsed[];
  importantEvents?: ImportantEvent[];
  achievements?: Achievement[];
  deathCause?: string;
}

// Life Summary
export interface LifeSummary {
  characterName: string;
  totalYears: number;
  majorEvents: string[];
  finalStats: GameStats;
  achievements: Achievement[];
  relationships: Record<string, string | number | boolean | null>;
  legacy: string;
}

// API Response Types
export interface GameResponse {
  success: boolean;
  data?: GameState;
  message?: string;
}

export interface GameActionResponse {
  success: boolean;
  data?: ParsedGameContent;
  message?: string;
}

export interface LifeSummaryResponse {
  success: boolean;
  data?: LifeSummary;
  message?: string;
}

// UI State Types
export interface GameUIState {
  isLoading: boolean;
  error?: string;
  gameState?: GameState;
  showInventory: boolean;
  showCharacterSheet: boolean;
  showLoreBook: boolean;
  showNPCPanel: boolean;
  showAchievements: boolean;
  selectedTab:
    | 'story'
    | 'inventory'
    | 'skills'
    | 'lore'
    | 'npcs'
    | 'achievements';
  actionInput: string;
  selectedChoice?: number;
  thinkingInput: string;
  communicationInput: string;
  actionMode: 'choice' | 'custom' | 'think' | 'communicate';
}

// Game Creation Flow
export interface GameCreationStep {
  step: 'settings' | 'character' | 'confirmation';
  completed: boolean;
  data: Record<string, any>;
}

export interface GameCreationState {
  currentStep: GameCreationStep['step'];
  steps: GameCreationStep[];
  gameSettings: Partial<GameSettingsDto>;
  isCreating: boolean;
  error?: string;
}

// Game List
export interface GameListItem {
  id: string;
  settings: GameSettingsDto;
  active: boolean;
  deathDate?: Date;
  deathCause?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAction?: string;
  currentChapter?: number;
  totalEvents?: number;
}

export interface GameListResponse {
  success: boolean;
  data?: GameListItem[];
  message?: string;
}

// Game Statistics
export interface GameStatistics {
  totalGames: number;
  activeGames: number;
  completedGames: number;
  averageGameLength: number;
  favoriteThemes: string[];
  totalPlaytime: number;
  achievementCount: number;
  deathReasons: { [reason: string]: number };
}

// Export validation helpers
export const validateGameSettings = (
  settings: Partial<GameSettingsDto>,
): boolean => {
  return !!(
    settings.theme &&
    settings.setting &&
    settings.characterName &&
    settings.characterBackstory
  );
};

export const validateGameAction = (action: GameActionDto): boolean => {
  return !!(
    action.choiceNumber ||
    action.action ||
    action.think ||
    action.communication
  );
};

// Type guards
export const isGameState = (obj: any): obj is GameState => {
  return obj && typeof obj === 'object' && 'id' in obj && 'settings' in obj;
};

export const isGameAction = (obj: any): obj is GameActionDto => {
  return (
    obj &&
    typeof obj === 'object' &&
    ('choiceNumber' in obj ||
      'action' in obj ||
      'think' in obj ||
      'communication' in obj)
  );
};
