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
  Name?: string;
  Description?: string;
  KnownAttributes?: string;
  HiddenAttributes?: string;
  Disposition?: string;
  Importance?: string;
  Type?: string;
  Location?: string;
  Occupation?: string;
  Age?: string;
  Gender?: string;
  Personality?: string;
  Background?: string;
  Motivation?: string;
  Secrets?: string;
  Connections?: string;
  [key: string]: string | undefined;
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

export interface LifeSummary {
  characterName: string;
  totalYears: number;
  majorEvents: string[];
  finalStats: GameStats;
  achievements: Achievement[];
  relationships: Record<string, string | number | boolean | null>;
  legacy: string;
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
  reputationChanges?: { [key: string]: number };
  npcsMet?: NpcMet[];
  itemsUsed?: ItemUsed[];
  importantEvents?: ImportantEvent[];
  achievements?: Achievement[];
  deathCause?: string;
}
