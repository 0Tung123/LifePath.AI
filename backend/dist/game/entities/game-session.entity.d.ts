import { Character } from './character.entity';
import { StoryNode } from './story-node.entity';
export declare class GameSession {
    id: string;
    isActive: boolean;
    startedAt: Date;
    updatedAt: Date;
    lastSavedAt: Date;
    endedAt: Date;
    currentStoryNodeId: string;
    gameState: {
        currentLocation: string;
        visitedLocations: string[];
        discoveredLocations: string[];
        completedQuests: string[];
        questLog: string[];
        acquiredItems: string[];
        npcRelations: Record<string, number>;
        flags: Record<string, any>;
        time?: {
            day: number;
            hour: number;
            minute: number;
        };
        weather?: string;
        dangerLevel: number;
        survivalChance: number;
        dangerWarnings: string[];
        nearDeathExperiences: number;
        pendingConsequences: string[];
    };
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'hardcore';
    permadeathEnabled: boolean;
    deathReason: string;
    character: Character;
    currentStoryNode: StoryNode;
    storyNodes: StoryNode[];
}
