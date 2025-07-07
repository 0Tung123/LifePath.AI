/**
 * Dynamic Type System - Core Types
 * Hệ thống type động dựa trên Tag-based system
 */

/**
 * Base property types for different categories
 */
export interface BaseProperties {
  [key: string]: string | number | boolean | string[] | null | undefined;
}

export interface ElementProperties extends BaseProperties {
  damage?: number | null;
  resistance?: number | null;
  immunity?: number | null;
}

export interface WeaponProperties extends BaseProperties {
  damage?: number | null;
  speed?: number | null;
  reach?: number | null;
  durability?: number | null;
}

export interface EnchantmentProperties extends BaseProperties {
  power_multiplier?: number | null;
  durability_bonus?: number | null;
  special_effects?: string[] | null;
}

export interface StatusProperties extends BaseProperties {
  duration?: number | null;
  intensity?: number | null;
  stacks?: number | null;
}

export type TagProperties =
  | ElementProperties
  | WeaponProperties
  | EnchantmentProperties
  | StatusProperties
  | BaseProperties;

export interface SynergyEffects extends BaseProperties {
  auto_resurrect?: number | null;
  stat_bonus?: number | null;
  new_ability?: string | null;
}

export interface ValidationParameters extends BaseProperties {
  min_count?: number | null;
  max_count?: number | null;
  required_tags?: string[] | null;
  forbidden_tags?: string[] | null;
}

export interface GenerationConfig extends BaseProperties {
  model?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
  context_window?: number | null;
}

/**
 * Tag System - Hệ thống thẻ cơ bản
 */
export interface Tag {
  id?: string;
  name: string;
  category: TagCategory;
  description?: string;
  properties?: TagProperties;
  rarity?: TagRarity;
  conflicts?: string[]; // Tags không thể kết hợp
  synergies?: TagSynergy[]; // Tags có hiệu ứng đặc biệt khi kết hợp
  createdBy: TagCreator;
  isActive: boolean;
  usageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tag Categories - Phân loại thẻ
 */
export enum TagCategory {
  // Character & NPC Tags
  RACE = 'race',
  CLASS = 'class',
  PERSONALITY = 'personality',
  BACKGROUND = 'background',
  FACTION = 'faction',

  // Skill & Effect Tags
  SKILL_TYPE = 'skill_type',
  ELEMENT = 'element',
  SCHOOL_OF_MAGIC = 'school_of_magic',
  COMBAT_STYLE = 'combat_style',
  EFFECT_TYPE = 'effect_type',

  // Talent & Gift Tags
  TALENT_ORIGIN = 'talent_origin',
  GIFT_TYPE = 'gift_type',
  BLOODLINE = 'bloodline',
  DIVINE_BLESSING = 'divine_blessing',

  // Equipment & Item Tags
  ITEM_TYPE = 'item_type',
  MATERIAL = 'material',
  CRAFTING_METHOD = 'crafting_method',
  ENCHANTMENT = 'enchantment',
  ARTIFACT_TIER = 'artifact_tier',

  // Status & Condition Tags
  CONDITION_TYPE = 'condition_type',
  CURSE_TYPE = 'curse_type',
  BLESSING_TYPE = 'blessing_type',
  DISEASE_TYPE = 'disease_type',

  // Story & Quest Tags
  QUEST_TYPE = 'quest_type',
  STORY_THEME = 'story_theme',
  LOCATION_TYPE = 'location_type',
  EVENT_TYPE = 'event_type',

  // Meta Tags
  RARITY = 'rarity',
  POWER_LEVEL = 'power_level',
  ALIGNMENT = 'alignment',
  CUSTOM = 'custom',
}

/**
 * Tag Rarity System
 */
export enum TagRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHICAL = 'mythical',
  DIVINE = 'divine',
  UNIQUE = 'unique',
}

/**
 * Tag Creator - Ai tạo ra tag này
 */
export interface TagCreator {
  type: 'ai' | 'admin' | 'system';
  id?: string; // User ID nếu là admin
  aiModel?: string; // Model AI nào tạo ra
  context?: string | undefined; // Context khi tạo - explicitly allow undefined
}

/**
 * Tag Synergy - Hiệu ứng khi kết hợp tags
 */
export interface TagSynergy {
  requiredTags: string[]; // Tags cần thiết
  effect: SynergyEffect;
  probability?: number; // Xác suất kích hoạt
  conditions?: ValidationParameters; // Điều kiện đặc biệt
}

/**
 * Synergy Effect - Hiệu ứng từ việc kết hợp tags
 */
export interface SynergyEffect {
  type: 'stat_bonus' | 'new_ability' | 'transformation' | 'special_event';
  name: string;
  description: string;
  effects: SynergyEffects;
  duration?: number; // -1 = permanent
}

/**
 * Dynamic Type - Type được tạo từ việc kết hợp tags
 */
export interface DynamicType {
  id?: string;
  name: string;
  description: string;
  category: DynamicTypeCategory;
  tags: string[]; // Tag IDs
  baseProperties: TagProperties;
  computedProperties?: TagProperties; // Tính toán từ tags
  activeSynergies?: TagSynergy[];
  rarity: TagRarity;
  powerLevel: number;
  createdBy: TagCreator;
  isTemplate: boolean; // Có phải template để tái sử dụng không
  usageCount?: number; // Số lần được sử dụng
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Dynamic Type Categories
 */
export enum DynamicTypeCategory {
  CHARACTER = 'character',
  NPC = 'npc',
  SKILL = 'skill',
  TALENT = 'talent',
  EQUIPMENT = 'equipment',
  ITEM = 'item',
  STATUS = 'status',
  QUEST = 'quest',
  EVENT = 'event',
  LOCATION = 'location',
}

/**
 * Validation Rule - Quy tắc validation cho dynamic types
 */
export interface ValidationRule {
  id?: string;
  name: string;
  description: string;
  category: DynamicTypeCategory;
  conditions: ValidationCondition[];
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
  createdAt?: Date;
}

/**
 * Validation Condition
 */
export interface ValidationCondition {
  type:
    | 'tag_required'
    | 'tag_forbidden'
    | 'tag_limit'
    | 'property_range'
    | 'custom';
  parameters: ValidationParameters;
  errorMessage: string;
}

/**
 * AI Generation Context - Context cho AI tạo content
 */
export interface AIGenerationContext {
  gameId: string;
  currentScene?: string;
  playerLevel?: number;
  storyContext?: string;
  existingTags?: string[];
  requiredCategories?: TagCategory[];
  powerLevelRange?: [number, number];
  rarityConstraints?: TagRarity[];
  customPrompt?: string;
}

/**
 * AI Generation Request
 */
export interface AIGenerationRequest {
  type: 'tag' | 'dynamic_type' | 'content_enhancement';
  context: AIGenerationContext;
  constraints?: ValidationRule[];
  count?: number; // Số lượng cần tạo
}

/**
 * AI Generation Response
 */
export interface AIGenerationResponse {
  success: boolean;
  data: (Tag | DynamicType)[];
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    confidence: number;
    warnings?: string[];
  };
  error?: string;
}

/**
 * Tag Combination Result - Kết quả khi kết hợp tags
 */
export interface TagCombinationResult {
  isValid: boolean;
  conflicts: string[];
  synergies: TagSynergy[];
  suggestedProperties: TagProperties;
  powerLevel: number;
  rarity: TagRarity;
  warnings?: string[];
}

/**
 * Dynamic Content Registry - Đăng ký các dynamic content
 */
export interface DynamicContentRegistry {
  tags: Map<string, Tag>;
  dynamicTypes: Map<string, DynamicType>;
  validationRules: Map<string, ValidationRule>;
  tagSynergies: Map<string, TagSynergy[]>;
}

/**
 * Content Generation Pipeline - Pipeline tạo content
 */
export interface ContentGenerationPipeline {
  id: string;
  name: string;
  steps: GenerationStep[];
  isActive: boolean;
}

/**
 * Generation Step
 */
export interface GenerationStep {
  id: string;
  name: string;
  type: 'ai_generation' | 'validation' | 'enhancement' | 'storage';
  config: GenerationConfig;
  order: number;
}

/**
 * Usage Statistics - Thống kê sử dụng
 */
export interface UsageStatistics {
  tagId?: string;
  dynamicTypeId?: string;
  usageCount: number;
  lastUsed: Date;
  contexts: string[]; // Các context đã sử dụng
  playerFeedback?: number; // Rating từ player
}
