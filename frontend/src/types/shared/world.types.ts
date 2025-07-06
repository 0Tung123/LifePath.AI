/**
 * World-building type definitions for dynamic and unlimited world creation
 * These types support the creation of infinite, procedural, and dynamic worlds
 */
import { BaseEntity } from './common.types';
import {
  DynamicAttribute,
  DynamicValue,
  EffectCondition,
} from './character.types';

// ============================================================================
// WORLD FOUNDATION TYPES
// ============================================================================

/**
 * Dynamic world - the container for all game content
 */
export interface DynamicWorld extends BaseEntity {
  // World Identity
  name: string;
  description?: string;
  theme: string;
  genre: string[];

  // World Properties
  size: 'pocket' | 'small' | 'medium' | 'large' | 'vast' | 'infinite';
  dimensions: number; // 2D, 3D, 4D, etc.

  // Physics & Rules
  physicsRules: PhysicsRule[];
  magicRules?: MagicRule[];
  naturalLaws: NaturalLaw[];

  // Time & Space
  timeSystem: TimeSystem;
  spaceSystem: SpaceSystem;

  // World State
  currentAge: WorldAge;
  worldEvents: WorldEvent[];
  globalFlags: Record<string, boolean>;
  globalCounters: Record<string, number>;

  // Dynamic Generation
  generationRules: GenerationRule[];
  proceduralSettings: ProceduralSettings;

  // Metadata
  createdBy?: string;
  lastModified?: string;
  version?: string;
}

/**
 * Physics rule for world behavior
 */
export interface PhysicsRule {
  id: string;
  name: string;
  description: string;
  type:
    | 'gravity'
    | 'thermodynamics'
    | 'electromagnetism'
    | 'quantum'
    | 'custom';

  // Rule Parameters
  parameters: Record<string, DynamicValue>;
  conditions?: EffectCondition[];

  // Scope
  scope: 'global' | 'regional' | 'local' | 'conditional';
  affectedAreas?: string[];

  // Interactions
  interactsWith?: string[]; // Other rule IDs
  overriddenBy?: string[]; // Rule IDs that can override this
}

/**
 * Magic rule for magical systems
 */
export interface MagicRule {
  id: string;
  name: string;
  description: string;
  type: 'elemental' | 'divine' | 'arcane' | 'primal' | 'void' | 'custom';

  // Magic Properties
  source: string; // Where magic comes from
  cost: string; // What it costs to use
  limitations: string[];

  // Schools & Disciplines
  schools?: MagicSchool[];
  disciplines?: MagicDiscipline[];

  // Interactions
  conflictsWith?: string[];
  enhancedBy?: string[];

  // World Integration
  affectsPhysics?: boolean;
  affectsNature?: boolean;
  affectsSociety?: boolean;
}

/**
 * Natural law - fundamental world rules
 */
export interface NaturalLaw {
  id: string;
  name: string;
  description: string;
  type: 'conservation' | 'causality' | 'entropy' | 'evolution' | 'custom';

  // Law Parameters
  strength: number; // How strongly enforced (0-100)
  flexibility: number; // How bendable (0-100)
  exceptions?: string[]; // Conditions where law doesn't apply

  // Effects
  effects: NaturalLawEffect[];
  violations: ViolationConsequence[];
}

/**
 * Natural law effect
 */
export interface NaturalLawEffect {
  type: 'automatic' | 'triggered' | 'conditional';
  description: string;
  effect: any;
  conditions?: EffectCondition[];
}

/**
 * Violation consequence
 */
export interface ViolationConsequence {
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  consequence: string;
  probability: number;
  delay?: number;
}

// ============================================================================
// TIME & SPACE SYSTEMS
// ============================================================================

/**
 * Time system for the world
 */
export interface TimeSystem {
  // Calendar System
  calendar: CalendarSystem;

  // Time Flow
  timeFlow: 'linear' | 'cyclical' | 'branching' | 'fluid' | 'custom';
  timeSpeed: number; // Relative to real time

  // Time Manipulation
  timeTravel?: TimeTravelRules;
  timeLoops?: TimeLoopRules;
  timeParadoxes?: ParadoxRules;

  // Temporal Events
  temporalEvents?: TemporalEvent[];

  // Current Time
  currentTime: WorldTime;
  timeHistory?: TimelineEvent[];
}

/**
 * Calendar system
 */
export interface CalendarSystem {
  name: string;

  // Time Units
  secondsPerMinute: number;
  minutesPerHour: number;
  hoursPerDay: number;
  daysPerWeek: number;
  weeksPerMonth: number;
  monthsPerYear: number;

  // Names
  dayNames: string[];
  monthNames: string[];
  seasonNames?: string[];

  // Special Days
  holidays?: Holiday[];
  astronomicalEvents?: AstronomicalEvent[];
}

/**
 * World time
 */
export interface WorldTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;

  // Additional Time Info
  season?: string;
  dayOfWeek?: string;
  dayOfYear?: number;

  // Celestial Info
  moonPhase?: string;
  sunPosition?: string;
  celestialEvents?: string[];
}

/**
 * Space system for the world
 */
export interface SpaceSystem {
  // Coordinate System
  coordinateSystem:
    | 'cartesian'
    | 'spherical'
    | 'cylindrical'
    | 'hyperbolic'
    | 'custom';
  dimensions: number;

  // Space Properties
  curvature?: 'flat' | 'curved' | 'variable';
  topology?: 'euclidean' | 'non_euclidean' | 'fractal';

  // Boundaries
  boundaries?: SpaceBoundary[];

  // Spatial Effects
  spatialDistortions?: SpatialDistortion[];
  dimensionalRifts?: DimensionalRift[];

  // Navigation
  navigationMethods?: NavigationMethod[];
}

/**
 * Space boundary
 */
export interface SpaceBoundary {
  type: 'hard' | 'soft' | 'permeable' | 'conditional';
  shape: 'sphere' | 'cube' | 'plane' | 'irregular' | 'custom';
  coordinates: number[];
  effects?: BoundaryEffect[];
}

/**
 * Boundary effect
 */
export interface BoundaryEffect {
  type: 'block' | 'teleport' | 'damage' | 'transform' | 'custom';
  description: string;
  parameters?: Record<string, any>;
}

// ============================================================================
// DYNAMIC GENERATION SYSTEM
// ============================================================================

/**
 * Generation rule for procedural content
 */
export interface GenerationRule {
  id: string;
  name: string;
  description: string;
  type: 'location' | 'character' | 'item' | 'quest' | 'event' | 'custom';

  // Generation Parameters
  frequency: number; // How often to generate
  conditions?: EffectCondition[];
  templates?: GenerationTemplate[];

  // Constraints
  maxInstances?: number;
  cooldown?: number;
  dependencies?: string[]; // Other rule IDs

  // Quality Control
  validationRules?: ValidationRule[];
  postProcessing?: PostProcessingStep[];
}

/**
 * Generation template
 */
export interface GenerationTemplate {
  id: string;
  name: string;
  weight: number; // Selection probability

  // Template Data
  baseData: Record<string, any>;
  variableFields: VariableField[];

  // Constraints
  requirements?: EffectCondition[];
  exclusions?: string[]; // Template IDs that conflict
}

/**
 * Variable field for templates
 */
export interface VariableField {
  fieldName: string;
  type: 'random' | 'calculated' | 'lookup' | 'custom';

  // Generation Parameters
  parameters?: Record<string, any>;
  constraints?: FieldConstraint[];

  // Dependencies
  dependsOn?: string[]; // Other field names
}

/**
 * Field constraint
 */
export interface FieldConstraint {
  type: 'range' | 'list' | 'pattern' | 'custom';
  value: any;
  description?: string;
}

/**
 * Procedural settings
 */
export interface ProceduralSettings {
  // Randomization
  seed?: string;
  randomness: number; // 0-100

  // Coherence
  coherenceLevel: number; // How consistent generated content is
  memoryDepth: number; // How far back to remember for consistency

  // Adaptation
  adaptToPlayer?: boolean;
  learningRate?: number;

  // Performance
  generationBudget?: number; // Max processing time/resources
  cacheSize?: number;

  // Quality
  qualityThreshold?: number;
  retryAttempts?: number;
}

// ============================================================================
// WORLD EVENTS & DYNAMICS
// ============================================================================

/**
 * World event - major happenings that affect the world
 */
export interface WorldEvent extends BaseEntity {
  // Event Identity
  name: string;
  description: string;
  type: 'natural' | 'political' | 'magical' | 'divine' | 'cosmic' | 'custom';

  // Event Properties
  magnitude: 'local' | 'regional' | 'continental' | 'global' | 'universal';
  duration: number; // -1 for permanent

  // Triggers
  triggers?: EventTrigger[];
  prerequisites?: EffectCondition[];

  // Effects
  immediateEffects?: WorldEventEffect[];
  ongoingEffects?: WorldEventEffect[];
  afterEffects?: WorldEventEffect[];

  // Progression
  phases?: EventPhase[];
  currentPhase?: number;

  // Responses
  possibleResponses?: EventResponse[];
  worldReactions?: WorldReaction[];

  // Status
  status: 'dormant' | 'building' | 'active' | 'resolving' | 'concluded';
  progress: number; // 0-100
}

/**
 * World event effect
 */
export interface WorldEventEffect {
  type:
    | 'environmental'
    | 'social'
    | 'economic'
    | 'magical'
    | 'technological'
    | 'custom';
  target: string;
  effect: any;
  duration?: number;
  reversible?: boolean;
}

/**
 * Event phase
 */
export interface EventPhase {
  id: string;
  name: string;
  description: string;
  duration: number;

  // Phase Effects
  effects: WorldEventEffect[];

  // Transition Conditions
  nextPhase?: string;
  transitionConditions?: EffectCondition[];
}

/**
 * Event response - how entities can respond to events
 */
export interface EventResponse {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'group' | 'faction' | 'nation' | 'species';

  // Requirements
  requirements?: EffectCondition[];
  cost?: ResourceCost[];

  // Effects
  effects: EventResponseEffect[];

  // Success/Failure
  successChance?: number;
  successEffects?: EventResponseEffect[];
  failureEffects?: EventResponseEffect[];
}

/**
 * Event response effect
 */
export interface EventResponseEffect {
  type:
    | 'modify_event'
    | 'create_event'
    | 'world_change'
    | 'character_effect'
    | 'custom';
  target?: string;
  effect: any;
  description?: string;
}

/**
 * World reaction - how the world responds to events
 */
export interface WorldReaction {
  trigger: EffectCondition;
  reaction: WorldEventEffect[];
  probability: number;
  delay?: number;
}

// ============================================================================
// CIVILIZATION & SOCIETY SYSTEMS
// ============================================================================

/**
 * Dynamic civilization
 */
export interface DynamicCivilization extends DynamicAttribute {
  // Civilization Identity
  species: string[];
  culture: CultureProfile;

  // Government & Politics
  government: GovernmentSystem;
  laws: LegalSystem[];

  // Economy
  economy: EconomicSystem;
  resources: CivilizationResource[];

  // Technology & Magic
  technologyLevel: TechnologyLevel;
  magicalKnowledge?: MagicalKnowledge;

  // Military & Defense
  military?: MilitarySystem;
  defenses?: DefenseSystem[];

  // Diplomacy
  relationships?: DiplomaticRelationship[];
  treaties?: Treaty[];

  // Population & Demographics
  population: PopulationData;
  settlements: string[]; // Location IDs

  // Development
  developmentLevel: number;
  growthRate: number;
  stability: number;

  // Dynamic Properties
  currentChallenges?: Challenge[];
  opportunities?: Opportunity[];

  // History
  historicalEvents?: HistoricalEvent[];
  foundingDate?: WorldTime;
}

/**
 * Culture profile
 */
export interface CultureProfile {
  name: string;
  values: CulturalValue[];
  traditions: Tradition[];
  beliefs: BeliefSystem[];

  // Social Structure
  socialHierarchy: SocialHierarchy;
  socialNorms: SocialNorm[];

  // Arts & Expression
  arts?: ArtForm[];
  language?: LanguageSystem;

  // Customs
  ceremonies?: Ceremony[];
  festivals?: Festival[];
  rituals?: Ritual[];
}

/**
 * Cultural value
 */
export interface CulturalValue {
  name: string;
  description: string;
  importance: number; // 0-100
  manifestations: string[];
}

/**
 * Government system
 */
export interface GovernmentSystem {
  type:
    | 'monarchy'
    | 'democracy'
    | 'oligarchy'
    | 'theocracy'
    | 'anarchy'
    | 'custom';
  structure: GovernmentStructure[];

  // Leadership
  leaders: Leader[];
  successionRules?: SuccessionRule[];

  // Power Distribution
  powerBalance: PowerBalance[];

  // Decision Making
  decisionProcess: DecisionProcess;

  // Stability
  legitimacy: number; // 0-100
  corruption: number; // 0-100
  efficiency: number; // 0-100
}

/**
 * Economic system
 */
export interface EconomicSystem {
  type:
    | 'barter'
    | 'currency'
    | 'gift'
    | 'command'
    | 'market'
    | 'mixed'
    | 'custom';

  // Currency
  currencies?: Currency[];
  exchangeRates?: ExchangeRate[];

  // Trade
  tradeRoutes?: TradeRoute[];
  tradeGoods?: TradeGood[];

  // Production
  industries?: Industry[];
  resources?: EconomicResource[];

  // Markets
  markets?: Market[];

  // Economic Indicators
  gdp?: number;
  inflation?: number;
  unemployment?: number;
  inequality?: number;
}

// ============================================================================
// MAGIC & SUPERNATURAL SYSTEMS
// ============================================================================

/**
 * Magic school
 */
export interface MagicSchool {
  id: string;
  name: string;
  description: string;
  philosophy: string;

  // School Properties
  element?: string;
  domain?: string;
  alignment?: string;

  // Spells & Abilities
  spells: string[]; // Skill IDs
  techniques: string[]; // Skill IDs

  // Learning
  learningRequirements?: EffectCondition[];
  masteryLevels?: MasteryLevel[];

  // Interactions
  synergiesWith?: string[]; // Other school IDs
  conflictsWith?: string[]; // Other school IDs
}

/**
 * Magic discipline
 */
export interface MagicDiscipline {
  id: string;
  name: string;
  description: string;
  type: 'academic' | 'intuitive' | 'divine' | 'primal' | 'forbidden' | 'custom';

  // Discipline Properties
  focusArea: string;
  methodology: string;

  // Practitioners
  practitionerTypes?: string[];
  organizations?: string[];

  // Knowledge
  theories?: MagicalTheory[];
  practices?: MagicalPractice[];

  // Restrictions
  taboos?: string[];
  dangers?: string[];
}

/**
 * Magical theory
 */
export interface MagicalTheory {
  id: string;
  name: string;
  description: string;
  complexity: number; // 1-10

  // Theory Content
  principles: string[];
  applications: string[];
  limitations: string[];

  // Discovery
  discoveredBy?: string;
  discoveryDate?: WorldTime;

  // Verification
  proven?: boolean;
  evidence?: string[];
  counterEvidence?: string[];
}

/**
 * Magical practice
 */
export interface MagicalPractice {
  id: string;
  name: string;
  description: string;
  type: 'ritual' | 'meditation' | 'crafting' | 'combat' | 'healing' | 'custom';

  // Practice Details
  steps: PracticeStep[];
  requirements: PracticeRequirement[];

  // Effects
  effects: MagicalEffect[];
  sideEffects?: MagicalEffect[];

  // Mastery
  difficultyLevel: number; // 1-10
  masteryIndicators?: string[];
}

/**
 * Practice step
 */
export interface PracticeStep {
  order: number;
  name: string;
  description: string;
  duration?: number;
  requirements?: EffectCondition[];
}

/**
 * Practice requirement
 */
export interface PracticeRequirement {
  type: 'material' | 'location' | 'time' | 'condition' | 'knowledge' | 'custom';
  description: string;
  optional?: boolean;
}

/**
 * Magical effect
 */
export interface MagicalEffect {
  type:
    | 'transformation'
    | 'creation'
    | 'destruction'
    | 'manipulation'
    | 'divination'
    | 'custom';
  description: string;
  magnitude: number;
  duration?: number;
  range?: string;
  area?: string;
}

// ============================================================================
// ADDITIONAL WORLD SYSTEMS
// ============================================================================

/**
 * Resource cost for various actions
 */
export interface ResourceCost {
  resource: string;
  amount: number;
  percentage?: boolean;
}

/**
 * Event trigger
 */
export interface EventTrigger {
  type: 'time' | 'condition' | 'action' | 'random' | 'custom';
  conditions?: EffectCondition[];
  probability?: number;
}

/**
 * Validation rule for generated content
 */
export interface ValidationRule {
  id: string;
  name: string;
  type: 'consistency' | 'balance' | 'lore' | 'quality' | 'custom';
  rule: (content: any) => boolean;
  errorMessage?: string;
}

/**
 * Post-processing step
 */
export interface PostProcessingStep {
  id: string;
  name: string;
  type: 'enhance' | 'validate' | 'optimize' | 'integrate' | 'custom';
  process: (content: any) => any;
}

/**
 * Time travel rules
 */
export interface TimeTravelRules {
  allowed: boolean;
  method?: string[];
  restrictions?: string[];
  paradoxHandling?: 'prevent' | 'resolve' | 'branch' | 'ignore';
}

/**
 * Time loop rules
 */
export interface TimeLoopRules {
  possible: boolean;
  maxDuration?: number;
  breakConditions?: EffectCondition[];
  memoryRetention?: 'full' | 'partial' | 'none';
}

/**
 * Paradox rules
 */
export interface ParadoxRules {
  handling: 'prevent' | 'resolve' | 'branch' | 'ignore' | 'catastrophic';
  consequences?: ParadoxConsequence[];
}

/**
 * Paradox consequence
 */
export interface ParadoxConsequence {
  type:
    | 'timeline_split'
    | 'reality_damage'
    | 'temporal_storm'
    | 'erasure'
    | 'custom';
  severity: number;
  description: string;
}

/**
 * Temporal event
 */
export interface TemporalEvent {
  id: string;
  name: string;
  type: 'loop' | 'skip' | 'rewind' | 'acceleration' | 'deceleration' | 'custom';
  startTime: WorldTime;
  duration: number;
  effects: TemporalEffect[];
}

/**
 * Temporal effect
 */
export interface TemporalEffect {
  type: 'time_dilation' | 'causality_loop' | 'temporal_displacement' | 'custom';
  magnitude: number;
  affectedArea?: string;
  description: string;
}

/**
 * Timeline event
 */
export interface TimelineEvent {
  timestamp: WorldTime;
  event: string;
  importance: number;
  consequences?: string[];
}

/**
 * Holiday
 */
export interface Holiday {
  name: string;
  date: { month: number; day: number };
  duration: number; // days
  type: 'religious' | 'cultural' | 'political' | 'seasonal' | 'custom';
  description?: string;
  traditions?: string[];
  effects?: HolidayEffect[];
}

/**
 * Holiday effect
 */
export interface HolidayEffect {
  type: 'mood' | 'commerce' | 'availability' | 'custom';
  effect: any;
  duration?: number;
}

/**
 * Astronomical event
 */
export interface AstronomicalEvent {
  name: string;
  type: 'eclipse' | 'conjunction' | 'meteor_shower' | 'comet' | 'custom';
  frequency: string; // e.g., "yearly", "every 76 years"
  nextOccurrence?: WorldTime;
  effects?: AstronomicalEffect[];
}

/**
 * Astronomical effect
 */
export interface AstronomicalEffect {
  type: 'magical' | 'tidal' | 'weather' | 'behavioral' | 'custom';
  description: string;
  magnitude: number;
  duration?: number;
}

/**
 * Spatial distortion
 */
export interface SpatialDistortion {
  id: string;
  name: string;
  type: 'wormhole' | 'fold' | 'maze' | 'expansion' | 'compression' | 'custom';
  location: number[];
  radius: number;
  effects: SpatialEffect[];
}

/**
 * Spatial effect
 */
export interface SpatialEffect {
  type: 'teleport' | 'disorient' | 'trap' | 'enhance' | 'custom';
  description: string;
  parameters?: Record<string, any>;
}

/**
 * Dimensional rift
 */
export interface DimensionalRift {
  id: string;
  name: string;
  origin: number[];
  destination: number[] | string; // coordinates or world ID
  stability: number; // 0-100
  size: number;

  // Access
  accessRequirements?: EffectCondition[];

  // Effects
  traversalEffects?: RiftEffect[];
  ambientEffects?: RiftEffect[];
}

/**
 * Rift effect
 */
export interface RiftEffect {
  type:
    | 'dimensional_shift'
    | 'energy_drain'
    | 'mutation'
    | 'temporal_displacement'
    | 'custom';
  description: string;
  probability: number;
  severity: number;
}

/**
 * Navigation method
 */
export interface NavigationMethod {
  name: string;
  type:
    | 'compass'
    | 'stars'
    | 'landmarks'
    | 'magical'
    | 'technological'
    | 'custom';
  accuracy: number; // 0-100
  requirements?: EffectCondition[];
  limitations?: string[];
}
