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
export interface ParsedGameContent {
    storyText: string;
    stats: GameStats;
    inventory: InventoryItem[];
    skills: Skill[];
    lore: LoreFragment[];
    choices: Choice[];
}
