/**
 * Character-related type definitions for dynamic world-building
 * These types are designed to be flexible and not limited to fixed structures
 */
import { BaseEntity } from './common.types';

// ============================================================================
// BASE DYNAMIC TYPES - Foundation for flexible system
// ============================================================================

/**
 * Base dynamic attribute that can represent any game element
 */
export interface DynamicAttribute {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  properties: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Numeric value with optional modifiers and constraints
 */
export interface DynamicValue {
  base: number;
  current: number;
  min?: number;
  max?: number;
  modifiers?: ValueModifier[];
  temporary?: number;
  percentage?: number;
}

/**
 * Value modifier for dynamic calculations
 */
export interface ValueModifier {
  id: string;
  name: string;
  type: 'flat' | 'percentage' | 'multiplier';
  value: number;
  source?: string;
  duration?: number;
  stackable?: boolean;
  conditions?: string[];
}

// ============================================================================
// 1. NHÂN VẬT CHÍNH & NPC - Dynamic Character System
// ============================================================================

/**
 * Base character interface - flexible for both PC and NPC
 */
export interface DynamicCharacter extends BaseEntity {
  // Core Identity
  name: string;
  title?: string;
  aliases?: string[];
  description?: string;
  appearance?: CharacterAppearance;

  // Character Type
  type: 'player' | 'npc' | 'companion' | 'enemy' | 'neutral';
  subtype?: string; // e.g., 'merchant', 'guard', 'noble', 'beast'

  // Dynamic Attributes - completely flexible
  attributes: Record<string, DynamicValue>;

  // Relationships & Social
  relationships?: Record<string, RelationshipData>;
  reputation?: Record<string, number>;
  factions?: FactionMembership[];

  // AI & Behavior (for NPCs)
  personality?: PersonalityTraits;
  motivations?: string[];
  fears?: string[];
  secrets?: string[];
  schedule?: NPCSchedule[];

  // Dynamic Properties
  customProperties?: Record<string, unknown>;
  flags?: Record<string, boolean>;
  counters?: Record<string, number>;
}

/**
 * Character appearance - flexible description system
 */
export interface CharacterAppearance {
  physicalDescription?: string;
  height?: string;
  build?: string;
  hairColor?: string;
  eyeColor?: string;
  skinTone?: string;
  distinguishingMarks?: string[];
  clothing?: string;
  accessories?: string[];
  aura?: string; // For magical/cultivation worlds
}

/**
 * Relationship data between characters
 */
export interface RelationshipData {
  characterId: string;
  characterName: string;
  relationshipType: string; // 'friend', 'enemy', 'family', 'lover', 'rival', etc.
  intimacyLevel: number; // 0-100
  trustLevel: number; // -100 to 100
  history?: string[];
  lastInteraction?: Date;
}

/**
 * Faction membership
 */
export interface FactionMembership {
  factionId: string;
  factionName: string;
  rank?: string;
  joinDate?: Date;
  reputation: number;
  permissions?: string[];
  responsibilities?: string[];
}

/**
 * Personality traits for NPCs
 */
export interface PersonalityTraits {
  traits: Record<string, number>; // e.g., 'brave': 80, 'greedy': 30
  alignment?: string;
  temperament?: string;
  speechPattern?: string;
  quirks?: string[];
}

/**
 * NPC Schedule for autonomous behavior
 */
export interface NPCSchedule {
  timeRange: string; // e.g., "08:00-12:00"
  activity: string;
  location?: string;
  priority: number;
  conditions?: string[];
}

// ============================================================================
// 2. KỸ NĂNG & HIỆU ỨNG - Dynamic Skill System
// ============================================================================

/**
 * Dynamic skill - can represent any ability, spell, technique
 */
export interface DynamicSkill extends DynamicAttribute {
  // Skill Mechanics
  level: number;
  experience: number;
  maxLevel?: number;

  // Requirements & Prerequisites
  requirements?: SkillRequirement[];
  prerequisites?: string[]; // Other skill IDs

  // Usage & Costs
  costs?: ResourceCost[];
  cooldown?: number;
  castTime?: number;
  range?: string;
  duration?: number;

  // Effects & Modifiers
  effects?: SkillEffect[];
  passiveEffects?: SkillEffect[];

  // Progression
  masteryBonuses?: Record<number, SkillEffect[]>; // Level -> Effects
  evolutionPaths?: SkillEvolution[];

  // Skill Tree
  parentSkills?: string[];
  childSkills?: string[];
  skillTree?: string;
}

/**
 * Skill requirement
 */
export interface SkillRequirement {
  type: 'attribute' | 'skill' | 'item' | 'condition' | 'custom';
  target: string;
  value: number | string;
  operator?: '>' | '>=' | '=' | '<=' | '<';
}

/**
 * Resource cost for skill usage
 */
export interface ResourceCost {
  resource: string; // 'mana', 'stamina', 'qi', 'health', etc.
  amount: number;
  percentage?: boolean;
}

/**
 * Skill effect - what the skill does
 */
export interface SkillEffect {
  id: string;
  name: string;
  type:
    | 'damage'
    | 'heal'
    | 'buff'
    | 'debuff'
    | 'utility'
    | 'transform'
    | 'custom';

  // Target & Area
  target: 'self' | 'single' | 'multiple' | 'area' | 'all';
  targetFilter?: string[]; // e.g., ['enemy', 'living']

  // Effect Values
  values?: Record<string, DynamicValue>;

  // Duration & Timing
  duration?: number;
  tickInterval?: number;
  delay?: number;

  // Conditions
  conditions?: EffectCondition[];

  // Visual & Audio
  animation?: string;
  sound?: string;
  particles?: string;
}

/**
 * Condition for effect activation
 */
export interface EffectCondition {
  type: 'health' | 'attribute' | 'status' | 'time' | 'location' | 'custom';
  operator: '>' | '>=' | '=' | '<=' | '<' | 'has' | 'not_has';
  value: string | number | boolean | string[];
  target?: 'self' | 'target' | 'environment';
}

/**
 * Skill evolution path
 */
export interface SkillEvolution {
  id: string;
  name: string;
  description: string;
  requirements: SkillRequirement[];
  newSkillId?: string;
  modifications?: SkillModification[];
}

/**
 * Skill modification for evolution
 */
export interface SkillModification {
  property: string;
  operation: 'set' | 'add' | 'multiply' | 'append';
  value: string | number | boolean | string[] | Record<string, unknown>;
}

// ============================================================================
// 3. TÀI NĂNG & THIÊN PHÚ - Dynamic Talent System
// ============================================================================

/**
 * Dynamic talent - innate abilities, bloodlines, special traits
 */
export interface DynamicTalent extends DynamicAttribute {
  // Talent Classification
  rarity:
    | 'common'
    | 'uncommon'
    | 'rare'
    | 'epic'
    | 'legendary'
    | 'mythic'
    | 'divine';
  origin:
    | 'innate'
    | 'bloodline'
    | 'acquired'
    | 'divine_gift'
    | 'cursed'
    | 'artificial';

  // Awakening & Growth
  awakeningLevel: number;
  maxAwakeningLevel?: number;
  awakeningProgress: number;

  // Talent Effects
  passiveEffects?: TalentEffect[];
  activeAbilities?: string[]; // Skill IDs unlocked by this talent

  // Awakening Stages
  awakeningStages?: AwakeningStage[];

  // Restrictions & Conflicts
  restrictions?: TalentRestriction[];
  conflictsWith?: string[]; // Other talent IDs that conflict

  // Inheritance & Evolution
  canInherit?: boolean;
  evolutionConditions?: TalentEvolution[];

  // Manifestation
  physicalManifestations?: string[];
  auralManifestations?: string[];
}

/**
 * Talent effect
 */
export interface TalentEffect {
  id: string;
  name: string;
  description: string;

  // Effect Type
  type:
    | 'attribute_bonus'
    | 'skill_bonus'
    | 'resistance'
    | 'immunity'
    | 'special_ability'
    | 'custom';

  // Target & Scope
  target?: string;
  scope: 'permanent' | 'conditional' | 'triggered';

  // Effect Values
  values?: Record<string, string | number | boolean | DynamicValue>;

  // Conditions
  activationConditions?: EffectCondition[];

  // Scaling
  scalesWithAwakening?: boolean;
  scalingFormula?: string;
}

/**
 * Awakening stage for talents
 */
export interface AwakeningStage {
  stage: number;
  name: string;
  description: string;
  requirements: TalentRequirement[];
  unlockedEffects: TalentEffect[];
  unlockedAbilities?: string[];
}

/**
 * Talent requirement
 */
export interface TalentRequirement {
  type:
    | 'level'
    | 'attribute'
    | 'skill'
    | 'item'
    | 'event'
    | 'condition'
    | 'custom';
  target?: string;
  value: string | number | boolean | string[];
  description?: string;
}

/**
 * Talent restriction
 */
export interface TalentRestriction {
  type: 'race' | 'class' | 'gender' | 'age' | 'condition' | 'custom';
  value: string | number | boolean | string[];
  description: string;
}

/**
 * Talent evolution
 */
export interface TalentEvolution {
  id: string;
  name: string;
  description: string;
  requirements: TalentRequirement[];
  newTalentId?: string;
  modifications?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

// ============================================================================
// 4. TRANG BỊ & VẬT PHẨM - Dynamic Item System
// ============================================================================

/**
 * Dynamic item - can represent any object in the game world
 */
export interface DynamicItem extends DynamicAttribute {
  // Basic Properties
  stackable: boolean;
  maxStack?: number;
  weight?: number;
  value?: number;

  // Item Classification
  itemType: string; // 'weapon', 'armor', 'consumable', 'material', 'quest', 'misc'
  subType?: string; // 'sword', 'potion', 'gem', etc.
  rarity:
    | 'common'
    | 'uncommon'
    | 'rare'
    | 'epic'
    | 'legendary'
    | 'artifact'
    | 'divine';

  // Equipment Properties
  equipSlot?: string; // 'main_hand', 'off_hand', 'head', 'chest', etc.
  equipRequirements?: ItemRequirement[];

  // Item Effects
  effects?: ItemEffect[];
  passiveEffects?: ItemEffect[];
  activeAbilities?: ItemAbility[];

  // Durability & Condition
  durability?: DynamicValue;
  condition?: string; // 'pristine', 'good', 'worn', 'damaged', 'broken'

  // Enhancement & Modification
  enhancementLevel?: number;
  maxEnhancementLevel?: number;
  enchantments?: ItemEnchantment[];
  modifications?: ItemModification[];

  // Crafting & Materials
  craftingMaterials?: CraftingMaterial[];
  craftingRecipe?: string;
  canBeCrafted?: boolean;
  canBeDisassembled?: boolean;

  // Special Properties
  soulbound?: boolean;
  tradeable?: boolean;
  destroyable?: boolean;

  // Set Items
  setId?: string;
  setBonuses?: SetBonus[];

  // Visual & Audio
  appearance?: ItemAppearance;
  sounds?: ItemSounds;
}

/**
 * Item requirement
 */
export interface ItemRequirement {
  type: 'level' | 'attribute' | 'skill' | 'class' | 'race' | 'condition';
  target?: string;
  value: string | number | boolean | string[];
  operator?: '>' | '>=' | '=' | '<=' | '<' | 'has' | 'not_has';
}

/**
 * Item effect
 */
export interface ItemEffect {
  id: string;
  name: string;
  description: string;
  type: 'stat_bonus' | 'skill_bonus' | 'resistance' | 'special' | 'custom';

  // Effect Values
  values?: Record<string, DynamicValue>;

  // Conditions
  conditions?: EffectCondition[];

  // Scaling
  scalesWithEnhancement?: boolean;
  scalingFormula?: string;
}

/**
 * Item active ability
 */
export interface ItemAbility {
  skillId: string;
  charges?: number;
  maxCharges?: number;
  rechargeTime?: number;
  rechargeConditions?: string[];
}

/**
 * Item enchantment
 */
export interface ItemEnchantment {
  id: string;
  name: string;
  description: string;
  effects: ItemEffect[];
  permanence: 'permanent' | 'temporary' | 'charges';
  duration?: number;
  charges?: number;
}

/**
 * Item modification
 */
export interface ItemModification {
  id: string;
  name: string;
  description: string;
  effects: ItemEffect[];
  slot?: string;
  removable: boolean;
}

/**
 * Crafting material
 */
export interface CraftingMaterial {
  itemId: string;
  itemName: string;
  quantity: number;
  quality?: string;
  replacements?: string[]; // Alternative material IDs
}

/**
 * Set bonus
 */
export interface SetBonus {
  requiredPieces: number;
  name: string;
  description: string;
  effects: ItemEffect[];
}

/**
 * Item appearance
 */
export interface ItemAppearance {
  model?: string;
  texture?: string;
  color?: string;
  size?: string;
  glow?: string;
  particles?: string;
}

/**
 * Item sounds
 */
export interface ItemSounds {
  equip?: string;
  unequip?: string;
  use?: string;
  impact?: string;
  break?: string;
}
