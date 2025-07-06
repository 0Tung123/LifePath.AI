import {
  GameStats,
  InventoryItem,
  Skill,
  LoreFragment,
  Choice,
  NpcInfo,
  ItemUsageRecord,
  ImportantEvent,
  Achievement,
  CharacterLifeSummary,
} from '../../common/types/game.types';

// Re-export types for convenience
export {
  GameStats,
  InventoryItem,
  Skill,
  LoreFragment,
  Choice,
  NpcInfo,
  ItemUsageRecord,
  ImportantEvent,
  Achievement,
  CharacterLifeSummary,
};

// Alias for backward compatibility
export type NpcMet = NpcInfo;
export type ItemUsed = ItemUsageRecord;

/**
 * Life summary for character
 */
export interface LifeSummary extends Partial<CharacterLifeSummary> {
  totalYears: number;
  majorEvents: string[];
  relationships: Record<string, unknown>;
  legacy: string;
}

/**
 * Parsed game content from AI response
 */
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
  npcsMet?: NpcInfo[];
  itemsUsed?: ItemUsageRecord[];
  importantEvents?: ImportantEvent[];
  achievements?: Achievement[];
}
