import { Character } from './character.entity';
export type LegacyItem = {
    id: string;
    name: string;
    description: string;
    rarity: string;
    type: string;
};
export type LegacyKnowledge = {
    title: string;
    content: string;
    importance: number;
};
export declare class Legacy {
    id: string;
    originCharacterId: string;
    originCharacter: Character;
    name: string;
    description: string;
    items: LegacyItem[];
    knowledge: LegacyKnowledge[];
    deathId: string;
    bonuses: Record<string, number>;
    isInherited: boolean;
    inheritorCharacterId: string;
    createdAt: Date;
}
