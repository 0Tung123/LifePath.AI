export interface GameTimeState {
  day: number;
  hour: number;
  minute: number;
}

export interface GameState {
  currentLocation: string;
  visitedLocations: string[];
  discoveredLocations: string[];
  completedQuests: string[];
  questLog: string[];
  acquiredItems: string[];
  npcRelations: Record<string, number>; // NPC ID to relation score
  flags: Record<string, boolean | number | string | null>; // Game flags for story branching
  time?: GameTimeState;
  weather?: string;
  
  // Permadeath related fields
  dangerLevel: number; // Current danger level from 0-10
  survivalChance: number; // Current chance of survival as a percentage
  dangerWarnings: string[]; // Array of warning messages
  nearDeathExperiences: number; // Counter of close calls
  pendingConsequences: string[]; // IDs of consequences that will trigger
}