/**
 * Common types used across the application
 */

export * from './api-response.type';
export * from './pagination.type';
export * from './user.types';

// Export from game.types
export * from './game.types';

// Explicitly re-export from game-engine.types to avoid conflicts
// with types already exported from game.types
import {
  ActionType,
  CharacterSkill,
  ContentSegment,
  DifficultyLevel,
  GameAction,
  GameChoice,
  GameLanguage,
  GameMode,
  GameState,
  ImportanceLevel,
  InteractionAttributes,
  InteractionType,
  KarmaChange,
  LifeSummary,
  LoreCategory,
  LoreFragment,
  LoreRelation,
  NpcRelationship,
  ParsedGameContent,
  ReputationChanges,
  StoryHistoryEntry,
  TriggeredEvent,
  WorldConfiguration,
  WorldImpact,
  WorldState,
} from './game-engine.types';

export {
  ActionType,
  CharacterSkill,
  ContentSegment,
  DifficultyLevel,
  GameAction,
  GameChoice,
  GameLanguage,
  GameMode,
  GameState,
  ImportanceLevel,
  InteractionAttributes,
  InteractionType,
  KarmaChange,
  LifeSummary,
  LoreCategory,
  LoreFragment,
  LoreRelation,
  NpcRelationship,
  ParsedGameContent,
  ReputationChanges,
  StoryHistoryEntry,
  TriggeredEvent,
  WorldConfiguration,
  WorldImpact,
  WorldState,
};
