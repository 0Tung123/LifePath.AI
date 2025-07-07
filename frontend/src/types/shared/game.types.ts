/**
 * Game-related type definitions shared between frontend and backend
 */
import { BaseEntity } from './common.types';

/**
 * Game difficulty levels
 */
export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  NIGHTMARE = 'nightmare',
}

/**
 * Game length options
 */
export enum GameLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  EPIC = 'epic',
}

/**
 * Combat style options
 */
export enum CombatStyle {
  STRATEGIC = 'strategic',
  BALANCED = 'balanced',
  AGGRESSIVE = 'aggressive',
  PACIFIST = 'pacifist',
}

/**
 * Game themes
 */
export enum GameTheme {
  FANTASY = 'fantasy',
  SCI_FI = 'sci-fi',
  HISTORICAL = 'historical',
  MODERN = 'modern',
  POST_APOCALYPTIC = 'post-apocalyptic',
  HORROR = 'horror',
  MYSTERY = 'mystery',
  WESTERN = 'western',
  CYBERPUNK = 'cyberpunk',
  STEAMPUNK = 'steampunk',
  CULTIVATION = 'cultivation',
  SUPERHERO = 'superhero',
}

/**
 * Character level information
 */
export interface CharacterLevel {
  current: number;
  xp: number;
  nextLevel?: number;
}

/**
 * Cultivation system information
 */
export interface CultivationInfo {
  realm: string;
  stage?: string;
  xp: number;
  nextRealm?: string;
}

/**
 * Experience points for different aspects of the character
 */
export interface ExperiencePoints {
  character: number;
  cultivation?: number;
  skills?: number;
}

/**
 * Skill experience tracking
 */
export interface SkillExperience {
  level: number;
  xp: number;
  nextLevel?: number;
}

/**
 * Game statistics for character
 */
export interface GameStats {
  [key: string]:
    | string
    | number
    | ExperiencePoints
    | Record<string, SkillExperience>
    | CharacterLevel
    | CultivationInfo;
}

/**
 * Inventory item
 */
export interface InventoryItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  type?: string;
  rarity?: string;
  value?: number;
  effects?: Record<string, number | string>;
  usable?: boolean;
  equippable?: boolean;
  equipped?: boolean;
  stackable?: boolean;
}

/**
 * Character skill
 */
export interface Skill {
  id?: string;
  name: string;
  description?: string;
  level?: number;
  mastery?: string;
  xp?: number;
  nextLevelXp?: number;
  type?: string;
  effects?: Record<string, number | string>;
  cooldown?: number;
  manaCost?: number;
  staminaCost?: number;
}

/**
 * Lore fragment types
 */
export enum LoreFragmentType {
  NPC = 'npc',
  ITEM = 'item',
  LOCATION = 'location',
  GENERAL = 'general',
}

/**
 * Lore fragment
 */
export interface LoreFragment {
  id?: string;
  type: LoreFragmentType | string;
  name?: string;
  title?: string;
  description?: string;
  content?: string;
  discoveredAt?: string | Date;
}

/**
 * Choice option
 */
export interface Choice {
  text: string;
  number: number;
  requirements?: Record<string, number | string>;
  consequences?: string[];
}

/**
 * Story segment types
 */
export enum StorySegmentType {
  STORY = 'story',
  USER_CHOICE = 'user_choice',
  USER_CUSTOM_ACTION = 'user_custom_action',
  USER_THINKING = 'user_thinking',
  USER_COMMUNICATION = 'user_communication',
  SYSTEM = 'system',
}

/**
 * Story segment
 */
export interface StorySegment {
  type: StorySegmentType | string;
  content: string;
  timestamp: string | Date;
}

/**
 * Chat history item roles
 */
export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

/**
 * Chat history item
 */
export interface ChatHistoryItem {
  role: ChatRole | string;
  content: string;
  timestamp?: string | Date;
}

/**
 * Knowledge base item
 */
export interface KnowledgeBaseItem {
  id?: string;
  type: LoreFragmentType | string;
  name: string;
  description: string;
  details?: Record<string, unknown>;
  relationships?: Record<string, string[]>;
  discoveredAt?: string | Date;
}

/**
 * NPC information
 */
export interface NpcInfo {
  id?: string;
  name: string;
  description: string;
  firstMet: string | Date;
  interactions: number;
  relationship?: number; // -100 to 100
  faction?: string;
  location?: string;
  role?: string;
  notes?: string[];
}

/**
 * Item usage record
 */
export interface ItemUsageRecord {
  id?: string;
  name: string;
  description: string;
  usedAt: string | Date;
  quantity: number;
  effect?: string;
  location?: string;
}

/**
 * Event types
 */
export enum EventType {
  QUEST = 'quest',
  COMBAT = 'combat',
  DISCOVERY = 'discovery',
  RELATIONSHIP = 'relationship',
  ACHIEVEMENT = 'achievement',
  STORY = 'story',
  SYSTEM = 'system',
}

/**
 * Important event
 */
export interface ImportantEvent {
  id?: string;
  title: string;
  description: string;
  timestamp: string | Date;
  type: EventType | string;
  location?: string;
  characters?: string[];
  consequences?: string[];
}

/**
 * Achievement
 */
export interface Achievement {
  id?: string;
  name: string;
  description: string;
  unlockedAt: string | Date;
  rarity?: string;
  hidden?: boolean;
  icon?: string;
}

/**
 * Additional game settings
 */
export interface AdditionalSettings {
  style?: string;
  difficulty?: GameDifficulty | string;
  gameLength?: GameLength | string;
  combatStyle?: CombatStyle | string;
  permadeath?: boolean;
  realisticNeeds?: boolean;
  enableRomance?: boolean;
  enableFactions?: boolean;
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Game settings
 */
export interface GameSettings {
  theme: GameTheme | string;
  setting: string;
  characterName: string;
  characterBackstory: string;
  additionalSettings?: AdditionalSettings;
}

/**
 * Create game DTO
 */
export interface CreateGameDto {
  gameSettings: GameSettings;
}

/**
 * Game action DTO
 */
export interface GameActionDto {
  choiceNumber?: number;
  action?: string;
  think?: string;
  communication?: string;
}

/**
 * Game entity
 */
export interface Game extends BaseEntity {
  userId: string;
  settings: GameSettings;
  storyHistory: StorySegment[];
  characterStats: GameStats;
  inventoryItems: InventoryItem[];
  characterSkills: Skill[];
  loreFragments: LoreFragment[];
  currentPrompt: string;
  currentChoices: Choice[];
  chatHistoryForGemini: ChatHistoryItem[];
  knowledgeBase: KnowledgeBaseItem[];
  currentObjective: string | null;
  npcsMet?: NpcInfo[];
  itemsUsed?: ItemUsageRecord[];
  importantEvents?: ImportantEvent[];
  achievements?: Achievement[];
  karmaScore: number;
  reputation?: Record<string, number>;
  active: boolean;
  deathDate?: string | Date | null;
  deathCause?: string | null;
}

/**
 * Character life summary
 */
export interface CharacterLifeSummary {
  characterName: string;
  theme: string;
  setting: string;
  birthDate: string | Date;
  deathDate: string | Date;
  deathCause: string;
  playTime: string;
  finalStats: GameStats;
  inventory: InventoryItem[];
  skills: Skill[];
  npcsMet: NpcInfo[];
  importantEvents: ImportantEvent[];
  totalChapters: number;
  achievements: Achievement[];
  karmaScore: number;
  reputation?: Record<string, number>;
  legacy?: string;
}

/**
 * Game summary request
 */
export interface GameSummaryRequest {
  gameId: string;
  type?: 'brief' | 'detailed';
}

/**
 * Game summary response
 */
export interface GameSummaryResponse {
  summary: string;
  highlights?: string[];
}

/**
 * Resurrection request
 */
export interface ResurrectionRequest {
  gameId: string;
  acceptPenalties: boolean;
}
