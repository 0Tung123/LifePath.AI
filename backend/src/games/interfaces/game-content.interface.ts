import {
  GameStats,
  InventoryItem,
  CharacterSkill,
  LoreFragment,
  GameChoice,
  ParsedGameContent,
  LifeSummary,
  ReputationChanges,
} from '../../common/types/game-engine.types';

// Re-export types for convenience
export {
  GameStats,
  InventoryItem,
  CharacterSkill,
  LoreFragment,
  GameChoice,
  ParsedGameContent,
  LifeSummary,
  ReputationChanges,
};

// Alias for backward compatibility
export type Skill = CharacterSkill;
export type Choice = GameChoice;

/**
 * NPC information for tracking interactions
 */
export interface NpcInfo {
  readonly name: string;
  readonly description: string;
  readonly relationship: string;
  readonly location: string;
  readonly importance: 'low' | 'medium' | 'high';
  readonly firstMet: Date;
  readonly lastInteraction: Date;
}

/**
 * Item usage tracking
 */
export interface ItemUsageRecord {
  readonly itemName: string;
  readonly usedAt: Date;
  readonly purpose: string;
  readonly effect: string;
  readonly location: string;
}

/**
 * Important event tracking
 */
export interface ImportantEvent {
  readonly title: string;
  readonly description: string;
  readonly date: Date;
  readonly location: string;
  readonly impact: 'positive' | 'negative' | 'neutral';
  readonly importance: 'low' | 'medium' | 'high';
  readonly participants: string[];
}

/**
 * Achievement tracking
 */
export interface Achievement {
  readonly name: string;
  readonly description: string;
  readonly unlockedAt: Date;
  readonly type: 'story' | 'combat' | 'social' | 'exploration' | 'special';
  readonly rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Legacy aliases for backward compatibility
export type NpcMet = NpcInfo;
export type ItemUsed = ItemUsageRecord;
