// Character stats interfaces for comprehensive character creation system
export interface BaseAttribute {
  name: string;
  value: number;
  description?: string;
  category: 'core' | 'derived' | 'social' | 'world_specific' | 'custom';
}

export interface CoreAttribute extends BaseAttribute {
  category: 'core';
  // Core attributes: Strength, Intelligence, Dexterity, Constitution, Charisma, Wisdom, Luck
  baseValue: number; // Original value before bonuses
  modifier: number; // Calculated modifier for other stats
}

export interface DerivedAttribute extends BaseAttribute {
  category: 'derived';
  // Derived from core attributes: Health, Mana, Stamina, etc.
  formula: string; // Formula to calculate this stat
  dependsOn: string[]; // Which core attributes this depends on
}

export interface SocialAttribute extends BaseAttribute {
  category: 'social';
  // Social stats: Fame, Infamy, Karma, Reputation with various factions
  faction?: string; // For reputation stats
  isPublic: boolean; // Whether this is visible to NPCs
}

export interface WorldSpecificAttribute extends BaseAttribute {
  category: 'world_specific';
  // World-specific stats: Mana Affinity, Ki Flow, Cybernetic Tolerance
  worldType: string; // Fantasy, Sci-fi, Modern, etc.
  isUnique: boolean; // Whether this is unique to this world type
}

export interface CustomAttribute extends BaseAttribute {
  category: 'custom';
  // User-defined or dynamically created stats
  createdBy: 'user' | 'ai' | 'system';
  isTemporary: boolean; // Whether this expires after time/events
}

// Character stats templates
export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'global' | 'setting_specific' | 'custom';
  worldTypes?: string[]; // If setting_specific, which world types this applies to
  backstory: string;
  attributes: Partial<Record<string, number>>;
  skills: string[];
  startingItems: string[];
  traits: string[];
  userId?: string; // For custom templates
  createdAt: Date;
  updatedAt: Date;
}

// Character creation process
export interface CharacterCreationStep {
  step: 'template' | 'backstory' | 'stats' | 'finalize';
  completed: boolean;
  data: Record<string, any>;
}

export interface CharacterCreationSession {
  gameId: string;
  userId: string;
  currentStep: 'template' | 'backstory' | 'stats' | 'finalize';
  steps: CharacterCreationStep[];
  selectedTemplate?: CharacterTemplate;
  customBackstory?: string;
  aiSuggestedStats?: Record<string, number>;
  finalStats?: Record<string, number>;
  totalPointsAllocated: number;
  maxPointsAllowed: number;
  createdAt: Date;
  updatedAt: Date;
}

// AI analysis response
export interface BackstoryAnalysis {
  characterArchetype: string;
  suggestedStats: Record<string, number>;
  reasoning: string;
  confidence: number; // 0-1 scale
  detectedKeywords: string[];
  worldContextAdjustments: Record<string, number>;
}

// Point allocation system
export interface PointAllocationRule {
  statName: string;
  baseCost: number;
  scalingFactor: number; // Cost increases as stat gets higher
  maxValue: number;
  minValue: number;
  category: 'core' | 'derived' | 'social' | 'world_specific' | 'custom';
}

export interface PointAllocationSystem {
  totalPoints: number;
  bonusPoints: number;
  rules: PointAllocationRule[];
  worldType: string;
}

// Character progression and dynamic stats
export interface StatModifier {
  id: string;
  name: string;
  description: string;
  type: 'temporary' | 'permanent' | 'conditional';
  duration?: number; // In game turns/time
  conditions?: string[]; // When this modifier applies
  effects: Record<string, number>;
  source: 'item' | 'skill' | 'event' | 'trait' | 'curse' | 'blessing';
  createdAt: Date;
  expiresAt?: Date;
}

export interface StatProgression {
  statName: string;
  currentValue: number;
  baseValue: number;
  experience: number;
  nextLevelAt: number;
  progressionRate: number;
  lastImprovedAt: Date;
  improvementSource: string;
}

// Character traits and special abilities
export interface CharacterTrait {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  category: 'combat' | 'social' | 'crafting' | 'magic' | 'unique';
  effects: Record<string, number | string>;
  requirements?: Record<string, number>; // Stat requirements
  conflicts?: string[]; // Traits that can't coexist
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'unique';
  unlockedAt?: Date;
  source: string; // How this trait was acquired
}

// World-specific stat systems
export interface WorldStatSystem {
  worldType: string;
  name: string;
  description: string;
  coreAttributes: string[];
  derivedAttributes: Record<string, string>; // name -> formula
  specialAttributes: string[];
  uniqueRules: string[];
  templates: CharacterTemplate[];
}

// Extended interfaces for game integration
export interface EnhancedGameStats {
  // Core attributes
  Strength?: number;
  Intelligence?: number;
  Dexterity?: number;
  Constitution?: number;
  Charisma?: number;
  Wisdom?: number;
  Luck?: number;

  // Derived attributes
  Health?: string; // "current/max" format
  Mana?: string;
  Stamina?: string;

  // Social attributes
  Fame?: number;
  Infamy?: number;
  Karma?: number;

  // World-specific (examples)
  ManaAffinity?: number;
  KiFlow?: number;
  CyberneticTolerance?: number;

  // Custom or dynamic stats
  [key: string]: string | number | undefined;
}

// Character creation result
export interface CharacterCreationResult {
  characterStats: EnhancedGameStats;
  selectedTemplate?: CharacterTemplate;
  customBackstory?: string;
  aiAnalysis?: BackstoryAnalysis;
  appliedTraits: CharacterTrait[];
  totalPointsUsed: number;
  creationMethod: 'template' | 'ai_analysis' | 'custom' | 'hybrid';
  createdAt: Date;
}
