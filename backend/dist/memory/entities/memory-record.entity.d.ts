import { Character } from '../../game/entities/character.entity';
import { GameSession } from '../../game/entities/game-session.entity';
export declare enum MemoryType {
    EVENT = "event",
    NPC = "npc",
    LOCATION = "location",
    ITEM = "item",
    LORE = "lore",
    QUEST = "quest",
    CONSEQUENCE = "consequence",
    LEGACY = "legacy",
    ACTION = "action",
    CONVERSATION = "conversation",
    EXPERIENCE = "experience",
    DEATH = "death"
}
export declare class MemoryRecord {
    id: string;
    title: string;
    content: string;
    characterId: string;
    character: Character;
    gameSessionId: string;
    gameSession: GameSession;
    type: MemoryType;
    tags: string[];
    embedding: number[];
    importance: number;
    createdAt: Date;
    updatedAt: Date;
}
