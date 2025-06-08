import { Character } from './character.entity';
import { StoryNode } from './story-node.entity';
import { StoryPath } from './story-path.entity';
export declare class GameSession {
    id: string;
    isActive: boolean;
    startedAt: Date;
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
    };
    character: Character;
    currentStoryNode: StoryNode;
    storyNodes: StoryNode[];
    storyPaths: StoryPath[];
}
