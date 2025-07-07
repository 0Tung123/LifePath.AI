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
// MISSING TYPE DEFINITIONS
// ============================================================================

export type WorldAge =
  | 'prehistoric'
  | 'ancient'
  | 'classical'
  | 'medieval'
  | 'renaissance'
  | 'industrial'
  | 'modern'
  | 'futuristic'
  | 'post-apocalyptic';

export interface LegalSystem {
  name: string;
  type: 'civil' | 'common' | 'religious' | 'tribal' | 'anarchic';
  enforcement: 'strict' | 'moderate' | 'lax' | 'corrupt';
}

export interface CivilizationResource {
  name: string;
  type: 'natural' | 'manufactured' | 'magical' | 'technological';
  abundance: 'scarce' | 'limited' | 'common' | 'abundant';
  value: number;
}

export type TechnologyLevel =
  | 'stone_age'
  | 'bronze_age'
  | 'iron_age'
  | 'medieval'
  | 'renaissance'
  | 'industrial'
  | 'modern'
  | 'advanced'
  | 'futuristic';

export interface MagicalKnowledge {
  schools: string[];
  commonSpells: string[];
  restrictions: string[];
  practitioners: number;
}

export interface MilitarySystem {
  type: 'professional' | 'militia' | 'feudal' | 'tribal' | 'mercenary';
  size: number;
  equipment: string[];
  training: 'poor' | 'basic' | 'good' | 'excellent' | 'elite';
}

export interface DefenseSystem {
  type: 'walls' | 'fortress' | 'natural' | 'magical' | 'technological';
  strength: number;
  coverage: 'partial' | 'full' | 'strategic';
}

export interface DiplomaticRelationship {
  target: string;
  status: 'allied' | 'friendly' | 'neutral' | 'hostile' | 'at_war';
  history: string[];
}

export interface Treaty {
  name: string;
  type: 'trade' | 'military' | 'non_aggression' | 'alliance';
  parties: string[];
  terms: string[];
}

export interface PopulationData {
  total: number;
  demographics: Record<string, number>;
  growth_rate: number;
  density: number;
}

export interface Challenge {
  name: string;
  type: 'economic' | 'military' | 'social' | 'environmental' | 'political';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
}

export interface Opportunity {
  name: string;
  type: 'economic' | 'military' | 'social' | 'technological' | 'diplomatic';
  potential: 'low' | 'medium' | 'high' | 'exceptional';
  description: string;
}

export interface HistoricalEvent {
  name: string;
  date: string;
  type: 'war' | 'discovery' | 'disaster' | 'political' | 'cultural';
  impact: 'local' | 'regional' | 'global';
  description: string;
}

export interface Tradition {
  name: string;
  type: 'religious' | 'cultural' | 'seasonal' | 'life_cycle';
  importance: 'minor' | 'moderate' | 'major' | 'sacred';
  description: string;
}

export interface BeliefSystem {
  name: string;
  type:
    | 'monotheistic'
    | 'polytheistic'
    | 'animistic'
    | 'philosophical'
    | 'secular';
  followers: number;
  influence: 'minimal' | 'moderate' | 'significant' | 'dominant';
}

export interface SocialHierarchy {
  type: 'caste' | 'class' | 'merit' | 'wealth' | 'birth' | 'egalitarian';
  mobility: 'none' | 'limited' | 'moderate' | 'high';
  levels: string[];
}

export interface SocialNorm {
  category: 'behavior' | 'dress' | 'speech' | 'interaction';
  rule: string;
  enforcement: 'social' | 'legal' | 'religious';
  penalty: string;
}

export interface ArtForm {
  name: string;
  type: 'visual' | 'performing' | 'literary' | 'musical' | 'craft';
  popularity: 'niche' | 'common' | 'popular' | 'universal';
  characteristics: string[];
}

export interface LanguageSystem {
  primary: string;
  dialects: string[];
  writing_system: 'none' | 'pictographic' | 'alphabetic' | 'syllabic';
  literacy_rate: number;
}

export interface Ceremony {
  name: string;
  type: 'religious' | 'political' | 'social' | 'seasonal';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'rare';
  participants: string[];
}

export interface Festival {
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'any';
  duration: number;
  activities: string[];
  significance: string;
}

export interface Ritual {
  name: string;
  purpose:
    | 'blessing'
    | 'protection'
    | 'celebration'
    | 'mourning'
    | 'transition';
  participants: string[];
  requirements: string[];
}

export interface GovernmentStructure {
  type:
    | 'monarchy'
    | 'republic'
    | 'democracy'
    | 'theocracy'
    | 'oligarchy'
    | 'anarchy';
  level: 'local' | 'regional' | 'national' | 'imperial';
  authority: string[];
}

export interface Leader {
  name: string;
  title: string;
  authority: string[];
  legitimacy: 'hereditary' | 'elected' | 'appointed' | 'conquered' | 'divine';
}

export interface SuccessionRule {
  type: 'hereditary' | 'elective' | 'appointive' | 'meritocratic';
  criteria: string[];
  process: string;
}

export interface PowerBalance {
  faction: string;
  influence: number;
  resources: string[];
  goals: string[];
}

export interface DecisionProcess {
  type: 'autocratic' | 'oligarchic' | 'democratic' | 'consensus';
  participants: string[];
  requirements: string[];
}

export interface Currency {
  name: string;
  type: 'metal' | 'paper' | 'digital' | 'commodity' | 'service';
  backing: string;
  stability: 'volatile' | 'unstable' | 'stable' | 'very_stable';
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  volatility: 'low' | 'medium' | 'high';
}

export interface TradeRoute {
  name: string;
  endpoints: string[];
  goods: string[];
  safety: 'dangerous' | 'risky' | 'safe' | 'secure';
}

export interface TradeGood {
  name: string;
  type: 'raw_material' | 'manufactured' | 'luxury' | 'necessity';
  origin: string;
  demand: 'low' | 'medium' | 'high' | 'critical';
}

export interface Industry {
  name: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  size: 'small' | 'medium' | 'large' | 'dominant';
  employment: number;
}

export interface EconomicResource {
  name: string;
  type: 'natural' | 'human' | 'capital' | 'technological';
  availability: 'scarce' | 'limited' | 'adequate' | 'abundant';
}

export interface Market {
  name: string;
  type: 'local' | 'regional' | 'national' | 'international';
  goods: string[];
  regulation: 'none' | 'light' | 'moderate' | 'heavy';
}

export interface MasteryLevel {
  skill: string;
  level: number;
  description: string;
  requirements: string[];
}

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
  effect: string | number | boolean | Record<string, unknown>;
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
  parameters?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
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
  baseData: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
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
  parameters?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
  constraints?: FieldConstraint[];

  // Dependencies
  dependsOn?: string[]; // Other field names
}

/**
 * Field constraint
 */
export interface FieldConstraint {
  type: 'range' | 'list' | 'pattern' | 'custom';
  value:
    | string
    | number
    | boolean
    | string[]
    | RegExp
    | Record<string, unknown>;
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
  effect: string | number | boolean | Record<string, unknown>;
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
  effect: string | number | boolean | Record<string, unknown>;
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
  rule: (content: Record<string, unknown>) => boolean;
  errorMessage?: string;
}

/**
 * Post-processing step
 */
export interface PostProcessingStep {
  id: string;
  name: string;
  type: 'enhance' | 'validate' | 'optimize' | 'integrate' | 'custom';
  process: (content: Record<string, unknown>) => Record<string, unknown>;
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
  effect: string | number | boolean | Record<string, unknown>;
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
  parameters?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
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
