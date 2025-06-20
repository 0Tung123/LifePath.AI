export interface GameStats {
    [key: string]: string | number;
}
export interface InventoryItem {
    name: string;
    description?: string;
    quantity: number;
}
export interface Skill {
    name: string;
    description?: string;
    level?: number;
    mastery?: string;
}
export interface LoreFragment {
    type: 'npc' | 'item' | 'location' | 'general';
    name?: string;
    title?: string;
    description?: string;
    content?: string;
}
export interface Choice {
    text: string;
    number: number;
}
export interface NpcMet {
    name: string;
    description: string;
    firstMet: Date;
    interactions: number;
}
export interface ItemUsed {
    name: string;
    description: string;
    usedAt: Date;
    quantity: number;
}
export interface ImportantEvent {
    title: string;
    description: string;
    timestamp: Date;
    type: string;
}
export interface Achievement {
    name: string;
    description: string;
    unlockedAt: Date;
}
export interface ParsedGameContent {
    storyText: string;
    stats: GameStats;
    inventory: InventoryItem[];
    skills: Skill[];
    lore: LoreFragment[];
    choices: Choice[];
    karmaChange?: number;
    karmaReason?: string;
    reputationChanges?: {
        [key: string]: number;
    };
    npcsMet?: NpcMet[];
    itemsUsed?: ItemUsed[];
    importantEvents?: ImportantEvent[];
    achievements?: Achievement[];
}
