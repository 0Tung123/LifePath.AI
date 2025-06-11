import { Character } from './character.entity';
import { StoryNode, TimeOfDay, Season } from './story-node.entity';
import { Bookmark } from './bookmark.entity';
export interface WorldLocation {
    id: string;
    name: string;
    description: string;
    timeOfDayDescription?: Record<TimeOfDay, string>;
    seasonDescription?: Record<Season, string>;
    originalState: string;
    currentState: string;
    connectedLocations: string[];
    npcIds: string[];
    pointsOfInterest?: {
        id: string;
        name: string;
        description: string;
        interactable: boolean;
    }[];
    requiredFlags?: string[];
}
export interface WorldNPC {
    id: string;
    name: string;
    description: string;
    factionIds: string[];
    reputation: number;
    relationship: 'hostile' | 'neutral' | 'friendly' | 'allied';
    currentLocationId: string;
    schedule?: {
        [key in TimeOfDay]?: {
            locationId: string;
            activity: string;
        };
    };
    memory?: {
        interactionId: string;
        type: string;
        content: string;
        date: Date;
    }[];
}
export interface WorldFaction {
    id: string;
    name: string;
    description: string;
    reputation: number;
    leaderNpcId?: string;
    alliedFactions?: string[];
    enemyFactions?: string[];
    territoriesIds?: string[];
}
export declare class GameSession {
    id: string;
    isActive: boolean;
    startedAt: Date;
    updatedAt: Date;
    lastSavedAt: Date;
    endedAt: Date;
    currentStoryNodeId: string;
    timeOfDay: TimeOfDay;
    season: Season;
    seasonDay: number;
    gameState: {
        currentLocation: string;
        visitedLocations: string[];
        discoveredLocations: string[];
        completedQuests: string[];
        activeQuests: string[];
        questLog: string[];
        acquiredItems: string[];
        flags: Record<string, any>;
        weather?: string;
        dangerLevel: number;
        survivalChance: number;
        dangerWarnings: string[];
        nearDeathExperiences: number;
        pendingConsequences: string[];
    };
    worldState: {
        locations: WorldLocation[];
        npcs: WorldNPC[];
        factions: WorldFaction[];
        changedLocations: Record<string, {
            previousState: string;
            newState: string;
            reason: string;
            timestamp: Date;
        }>;
    };
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'hardcore';
    permadeathEnabled: boolean;
    deathReason: string;
    decisionHistory: {
        id: string;
        timestamp: Date;
        nodeId: string;
        decisionType: string;
        content: string;
        weight: number;
        affectedTraits?: Record<string, number>;
        affectedStats?: Record<string, number>;
        affectedFactions?: Record<string, number>;
        tags?: string[];
    }[];
    gameplayProfile: {
        combatPreference: number;
        dialogueLength: number;
        explorationTendency: number;
        moralAlignment: number;
        riskTolerance: number;
        writingStyle?: Record<string, any>;
        difficultyLevel: number;
        preferredThemes?: Record<string, number>;
    };
    character: Character;
    currentStoryNode: StoryNode;
    storyNodes: StoryNode[];
    bookmarks: Bookmark[];
}
