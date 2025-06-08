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
    npcRelations: Record<string, number>;
    flags: Record<string, boolean | number | string | null>;
    time?: GameTimeState;
    weather?: string;
    dangerLevel: number;
    survivalChance: number;
    dangerWarnings: string[];
    nearDeathExperiences: number;
    pendingConsequences: string[];
}
