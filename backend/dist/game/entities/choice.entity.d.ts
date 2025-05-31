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
        }[];
        itemLosses: {
            id: string;
            quantity: number;
        }[];
        relationChanges: Record<string, number>;
        flagChanges: Record<string, boolean>;
    };
    storyNode: StoryNode;
    nextPrompt: string;
}
