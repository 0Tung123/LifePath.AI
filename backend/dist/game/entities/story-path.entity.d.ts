import { GameSession } from './game-session.entity';
import { StoryNode } from './story-node.entity';
export declare class StoryPath {
    id: string;
    nodeId: string;
    choiceId: string;
    choiceText: string;
    stepOrder: number;
    isActive: boolean;
    branchId: string;
    parentPathId: string;
    createdAt: Date;
    gameSession: GameSession;
    storyNode: StoryNode;
}
