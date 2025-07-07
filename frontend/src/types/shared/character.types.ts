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
  createdAt?: string;
  updatedAt?: string;
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
  lastInteraction?: string;
}

/**
 * Faction membership
 */
export interface FactionMembership {
  factionId: string;
  factionName: string;
  rank?: string;
  joinDate?: string;
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
  modifiedProperties: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
  addedEffects?: ItemEffect[];
  removedEffects?: string[];
}

/**
 * Crafting material
 */
export interface CraftingMaterial {
  itemId: string;
  quantity: number;
  quality?: string;
  alternatives?: string[]; // Alternative item IDs
}

/**
 * Set bonus
 */
export interface SetBonus {
  requiredPieces: number;
  effects: ItemEffect[];
  name: string;
  description: string;
}

/**
 * Item appearance
 */
export interface ItemAppearance {
  model?: string;
  texture?: string;
  color?: string;
  glow?: string;
  particles?: string;
  scale?: number;
}

/**
 * Item sounds
 */
export interface ItemSounds {
  equip?: string;
  unequip?: string;
  use?: string;
  break?: string;
  enhance?: string;
}

// ============================================================================
// 5. TÌNH TRẠNG & TRẠNG THÁI - Dynamic Status System
// ============================================================================

/**
 * Dynamic status effect - buffs, debuffs, conditions
 */
export interface DynamicStatus extends DynamicAttribute {
  // Status Classification
  statusType: 'buff' | 'debuff' | 'neutral' | 'special';
  severity?: 'minor' | 'moderate' | 'major' | 'critical' | 'fatal';

  // Duration & Timing
  duration: number; // -1 for permanent
  remainingTime?: number;
  tickInterval?: number;

  // Stacking
  stackable: boolean;
  maxStacks?: number;
  currentStacks?: number;
  stackType?: 'intensity' | 'duration' | 'both';

  // Effects
  effects: StatusEffect[];
  onApplyEffects?: StatusEffect[];
  onRemoveEffects?: StatusEffect[];
  onTickEffects?: StatusEffect[];

  // Conditions
  applicationConditions?: EffectCondition[];
  removalConditions?: EffectCondition[];
  immunityConditions?: EffectCondition[];

  // Interactions
  suppressedBy?: string[]; // Status IDs that suppress this
  suppresses?: string[]; // Status IDs this suppresses
  conflictsWith?: string[]; // Status IDs that conflict

  // Resistance & Immunity
  canBeResisted?: boolean;
  resistanceAttribute?: string;
  canBeImmune?: boolean;
  immunityAttributes?: string[];

  // Visual & Audio
  visualEffects?: StatusVisualEffect[];
  sounds?: StatusSounds;
}

/**
 * Status effect
 */
export interface StatusEffect {
  id: string;
  name: string;
  type:
    | 'modify_attribute'
    | 'modify_skill'
    | 'damage_over_time'
    | 'heal_over_time'
    | 'special'
    | 'custom';

  // Target & Values
  target?: string;
  values?: Record<string, DynamicValue>;

  // Scaling
  scalesWithStacks?: boolean;
  scalesWithCasterLevel?: boolean;
  scalingFormula?: string;

  // Conditions
  conditions?: EffectCondition[];
}

/**
 * Status visual effect
 */
export interface StatusVisualEffect {
  type: 'particle' | 'aura' | 'overlay' | 'animation';
  asset: string;
  color?: string;
  intensity?: number;
  position?: string;
}

/**
 * Status sounds
 */
export interface StatusSounds {
  apply?: string;
  tick?: string;
  remove?: string;
  resist?: string;
}

// ============================================================================
// 6. CỐT TRUYỆN & NHIỆM VỤ - Dynamic Quest System
// ============================================================================

/**
 * Dynamic quest - flexible mission system
 */
export interface DynamicQuest extends DynamicAttribute {
  // Quest Classification
  questType:
    | 'main'
    | 'side'
    | 'daily'
    | 'weekly'
    | 'event'
    | 'hidden'
    | 'chain'
    | 'repeatable';
  difficulty: 'trivial' | 'easy' | 'normal' | 'hard' | 'extreme' | 'impossible';

  // Quest State
  status:
    | 'not_started'
    | 'available'
    | 'active'
    | 'completed'
    | 'failed'
    | 'abandoned';
  progress: QuestProgress;

  // Requirements
  prerequisites?: QuestPrerequisite[];
  levelRequirement?: number;

  // Objectives
  objectives: QuestObjective[];
  currentObjective?: number;

  // Rewards
  rewards?: QuestReward[];
  failurePenalties?: QuestPenalty[];

  // Time Constraints
  timeLimit?: number;
  remainingTime?: number;

  // Quest Chain
  chainId?: string;
  previousQuest?: string;
  nextQuest?: string;

  // NPCs & Locations
  questGiver?: string; // Character ID
  questLocation?: string;
  involvedNPCs?: string[];

  // Story Integration
  storyImpact?: StoryImpact[];
  worldStateChanges?: WorldStateChange[];

  // Dynamic Properties
  variables?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
  flags?: Record<string, boolean>;
}

/**
 * Quest progress tracking
 */
export interface QuestProgress {
  overallProgress: number; // 0-100
  objectiveProgress: Record<string, number>;
  completedObjectives: string[];
  failedObjectives: string[];
  startTime?: string;
  completionTime?: string;
}

/**
 * Quest prerequisite
 */
export interface QuestPrerequisite {
  type:
    | 'quest'
    | 'level'
    | 'attribute'
    | 'skill'
    | 'item'
    | 'reputation'
    | 'condition';
  target?: string;
  value: string | number | boolean | string[];
  operator?: '>' | '>=' | '=' | '<=' | '<' | 'has' | 'not_has';
  description?: string;
}

/**
 * Quest objective
 */
export interface QuestObjective {
  id: string;
  name: string;
  description: string;
  type:
    | 'kill'
    | 'collect'
    | 'deliver'
    | 'talk'
    | 'reach'
    | 'survive'
    | 'protect'
    | 'custom';

  // Objective Details
  target?: string;
  targetCount?: number;
  currentCount?: number;
  location?: string;

  // Conditions
  conditions?: ObjectiveCondition[];

  // Status
  status: 'pending' | 'active' | 'completed' | 'failed';
  optional?: boolean;
  hidden?: boolean;

  // Sub-objectives
  subObjectives?: QuestObjective[];
}

/**
 * Objective condition
 */
export interface ObjectiveCondition {
  type: 'time' | 'location' | 'health' | 'stealth' | 'custom';
  value: string | number | boolean | string[];
  description?: string;
}

/**
 * Quest reward
 */
export interface QuestReward {
  type:
    | 'experience'
    | 'item'
    | 'currency'
    | 'reputation'
    | 'skill'
    | 'title'
    | 'custom';
  target?: string;
  amount?: number;
  itemId?: string;
  itemQuantity?: number;
  description?: string;
}

/**
 * Quest penalty
 */
export interface QuestPenalty {
  type: 'experience' | 'reputation' | 'item_loss' | 'status' | 'custom';
  target?: string;
  amount?: number;
  description?: string;
}

/**
 * Story impact
 */
export interface StoryImpact {
  type:
    | 'character_relationship'
    | 'world_event'
    | 'faction_standing'
    | 'story_branch';
  target: string;
  impact: string | number | boolean | Record<string, unknown>;
  description?: string;
}

/**
 * World state change
 */
export interface WorldStateChange {
  type:
    | 'npc_behavior'
    | 'location_access'
    | 'item_availability'
    | 'dialogue_option';
  target: string;
  change: string | number | boolean | Record<string, unknown>;
  permanent?: boolean;
  description?: string;
}

// ============================================================================
// ADDITIONAL DYNAMIC SYSTEMS
// ============================================================================

/**
 * Dynamic event - world events, random encounters
 */
export interface DynamicEvent extends DynamicAttribute {
  eventType:
    | 'random_encounter'
    | 'world_event'
    | 'weather'
    | 'disaster'
    | 'celebration'
    | 'custom';

  // Trigger Conditions
  triggerConditions?: EventTrigger[];
  triggerChance?: number;

  // Event Effects
  effects?: EventEffect[];

  // Duration & Timing
  duration?: number;
  cooldown?: number;

  // Scope
  scope: 'global' | 'regional' | 'local' | 'personal';
  affectedAreas?: string[];

  // Choices & Outcomes
  choices?: EventChoice[];
  outcomes?: EventOutcome[];
}

/**
 * Event trigger
 */
export interface EventTrigger {
  type: 'time' | 'location' | 'action' | 'condition' | 'random';
  conditions?: EffectCondition[];
  probability?: number;
}

/**
 * Event effect
 */
export interface EventEffect {
  type:
    | 'world_state'
    | 'character_effect'
    | 'item_spawn'
    | 'npc_behavior'
    | 'custom';
  target?: string;
  effect: string | number | boolean | Record<string, unknown>;
  duration?: number;
}

/**
 * Event choice
 */
export interface EventChoice {
  id: string;
  text: string;
  requirements?: EffectCondition[];
  outcomes: string[]; // Outcome IDs
}

/**
 * Event outcome
 */
export interface EventOutcome {
  id: string;
  description: string;
  effects: EventEffect[];
  probability?: number;
}

/**
 * Dynamic location - flexible world building
 */
export interface DynamicLocation extends DynamicAttribute {
  // Location Properties
  locationType: string; // 'city', 'dungeon', 'forest', 'mountain', etc.
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'massive';

  // Geography
  coordinates?: { x: number; y: number; z?: number };
  climate?: string;
  terrain?: string[];

  // Connections
  connectedLocations?: LocationConnection[];

  // Population & NPCs
  population?: number;
  residents?: string[]; // Character IDs
  visitors?: string[]; // Character IDs

  // Services & Features
  services?: LocationService[];
  features?: LocationFeature[];

  // Resources & Items
  resources?: LocationResource[];
  hiddenItems?: string[]; // Item IDs

  // Events & Activities
  events?: string[]; // Event IDs
  activities?: LocationActivity[];

  // Dynamic Properties
  weatherConditions?: WeatherCondition[];
  timeOfDayEffects?: TimeEffect[];

  // Access & Security
  accessRequirements?: EffectCondition[];
  securityLevel?: number;
  guards?: string[]; // Character IDs
}

/**
 * Location connection
 */
export interface LocationConnection {
  locationId: string;
  connectionType: 'road' | 'path' | 'portal' | 'teleport' | 'secret' | 'custom';
  travelTime?: number;
  difficulty?: string;
  requirements?: EffectCondition[];
  cost?: ResourceCost[];
}

/**
 * Location service
 */
export interface LocationService {
  type:
    | 'shop'
    | 'inn'
    | 'temple'
    | 'guild'
    | 'training'
    | 'crafting'
    | 'custom';
  providerId?: string; // Character ID
  availability?: string; // Time conditions
  cost?: ResourceCost[];
  requirements?: EffectCondition[];
}

/**
 * Location feature
 */
export interface LocationFeature {
  name: string;
  description: string;
  type: 'landmark' | 'hazard' | 'resource' | 'mystery' | 'custom';
  effects?: LocationEffect[];
  interactable?: boolean;
  requirements?: EffectCondition[];
}

/**
 * Location resource
 */
export interface LocationResource {
  resourceType: string;
  abundance: 'scarce' | 'limited' | 'common' | 'abundant' | 'infinite';
  quality?: string;
  harvestRequirements?: EffectCondition[];
  respawnTime?: number;
}

/**
 * Location activity
 */
export interface LocationActivity {
  name: string;
  description: string;
  type: string;
  requirements?: EffectCondition[];
  rewards?: QuestReward[];
  duration?: number;
  cooldown?: number;
}

/**
 * Weather condition
 */
export interface WeatherCondition {
  type: string; // 'sunny', 'rainy', 'stormy', 'snowy', etc.
  intensity: number; // 0-100
  effects?: LocationEffect[];
  duration?: number;
  probability?: number;
}

/**
 * Time effect
 */
export interface TimeEffect {
  timeRange: string; // e.g., "night", "dawn", "06:00-18:00"
  effects: LocationEffect[];
  description?: string;
}

/**
 * Location effect
 */
export interface LocationEffect {
  type: 'attribute_modifier' | 'skill_modifier' | 'status_effect' | 'custom';
  target?: string;
  effect: string | number | boolean | Record<string, unknown>;
  conditions?: EffectCondition[];
}
