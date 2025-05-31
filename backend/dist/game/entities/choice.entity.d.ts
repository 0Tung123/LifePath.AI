import { StoryNode } from './story-node.entity';
export declare class Choice {
    id: string;
    text: string;
    requiredAttribute: string;
    requiredAttributeValue: number;
    requiredSkill: string;
    requiredItem: string;
    consequences: {
        attributeChanges: Record<string, number>;
        skillGains: string[];
        itemGains: {
            id: string;
            name: string;
            quantity: number;
            description?: string;
            type?: string;
            rarity?: string;
            value?: number;
        }[];
        itemLosses: {
            id: string;
            name: string;
            quantity: number;
        }[];
        relationChanges: Record<string, number>;
        flagChanges: Record<string, boolean>;
        currencyChanges?: Record<string, number>;
        flags?: Record<string, any>;
        locationChange?: string;
    };
    storyNode: StoryNode;
    nextPrompt: string;
}
