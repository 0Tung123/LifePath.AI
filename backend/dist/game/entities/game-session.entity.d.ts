import { Character } from './character.entity';
import { StoryNode } from './story-node.entity';
export declare class GameSession {
    id: string;
    isActive: boolean;
    startedAt: Date;
    lastSavedAt: Date;
    currentStoryNodeId: string;
    gameState: {
        visitedLocations: string[];
        completedQuests: string[];
        acquiredItems: string[];
        npcRelations: Record<string, number>;
        flags: Record<string, boolean>;
    };
    character: Character;
    currentStoryNode: StoryNode;
    storyNodes: StoryNode[];
}
