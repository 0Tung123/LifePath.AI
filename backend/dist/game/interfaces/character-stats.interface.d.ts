export interface SurvivalStats {
    daysSurvived: number;
    dangerousSituationsOvercome: number;
    nearDeathExperiences: number;
    majorDecisionsMade: number;
}
export interface CharacterRelationship {
    npcId: string;
    name: string;
    relation: number;
    type: string;
}
export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    quantity: number;
    type?: string;
    effects?: Record<string, any>;
    value?: number;
    rarity?: string;
}
export interface CharacterCurrency {
    gold?: number;
    credits?: number;
    yuan?: number;
    spirit_stones?: number;
    [key: string]: number | undefined;
}
export interface CharacterInventory {
    items: InventoryItem[];
    currency: CharacterCurrency;
}
export interface SpecialAbility {
    name: string;
    description: string;
    cooldown?: number;
    cost?: {
        type: string;
        amount: number;
    };
}
