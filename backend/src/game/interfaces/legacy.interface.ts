import { LegacyItem, LegacyKnowledge } from "../entities/legacy.entity";

export interface LegacyBonuses {
  startingExperience?: number;
  survivalBonus?: number;
  questExperience?: number;
  strengthBonus?: number;
  intelligenceBonus?: number;
  dexterityBonus?: number;
  charismaBonus?: number;
  healthBonus?: number;
  manaBonus?: number;
  skillPoints?: number;
  reputationBonus?: number;
  [key: string]: number | undefined;
}

export interface CreateLegacyDto {
  originCharacterId: string;
  name: string;
  description: string;
  items: LegacyItem[];
  knowledge: LegacyKnowledge[];
  deathId?: string;
  bonuses: LegacyBonuses;
}