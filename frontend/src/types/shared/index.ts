/**
 * Shared types between frontend and backend
 *
 * This file exports all shared type definitions to be used across the application
 */

export * from './game.types';
export * from './user.types';
export * from './common.types';

// Export chỉ những types cần thiết từ game-engine.types
export type { CharacterAttributes, GameStats } from './game-engine.types';
export type { InventoryItem } from './game-engine.types';
