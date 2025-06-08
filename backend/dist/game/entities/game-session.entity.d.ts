import { Character } from './character.entity';
import { StoryNode } from './story-node.entity';
import { GameState } from '../interfaces/game-state.interface';
export declare class GameSession {
    id: string;
    isActive: boolean;
    startedAt: Date;
    updatedAt: Date;
    lastSavedAt: Date;
    endedAt: Date;
    currentStoryNodeId: string;
    gameState: GameState;
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'hardcore';
    permadeathEnabled: boolean;
    deathReason: string;
    character: Character;
    currentStoryNode: StoryNode;
    storyNodes: StoryNode[];
}
