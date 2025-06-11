import { GameSession } from './game-session.entity';
import { StoryNode } from './story-node.entity';
export declare class Bookmark {
    id: string;
    name: string;
    description: string;
    autoSummary: string;
    createdAt: Date;
    gameSessionId: string;
    storyNodeId: string;
    gameSession: GameSession;
    storyNode: StoryNode;
}
