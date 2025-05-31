/**
 * Game related types
 */

export enum GameGenre {
  FANTASY = "fantasy",
  MODERN = "modern",
  SCIFI = "scifi",
  XIANXIA = "xianxia",
  WUXIA = "wuxia",
  HORROR = "horror",
  CYBERPUNK = "cyberpunk",
  STEAMPUNK = "steampunk",
  POSTAPOCALYPTIC = "postapocalyptic",
  HISTORICAL = "historical",
}

export interface CharacterAttributes {
  strength: number;
  intelligence: number;
  dexterity: number;
  charisma: number;
  health: number;
  mana: number;
  cultivation?: number;
  qi?: number;
  perception?: number;
  tech?: number;
  hacking?: number;
  piloting?: number;
  sanity?: number;
  willpower?: number;
  education?: number;
  wealth?: number;
  influence?: number;
  [key: string]: number | undefined;
}

export interface Character {
  id: string;
  name: string;
  characterClass: string;
  primaryGenre: GameGenre;
  secondaryGenres?: GameGenre[];
  customGenreDescription?: string;
  attributes: CharacterAttributes;
  skills: string[];
  specialAbilities?: {
    name: string;
    description: string;
    cooldown?: number;
    cost?: {
      type: string;
      amount: number;
    };
  }[];
  inventory?: {
    items: {
      id: string;
      name: string;
      description: string;
      quantity: number;
      type?: string;
      effects?: Record<string, string | number | boolean>;
      value?: number;
      rarity?: string;
    }[];
    currency: {
      gold?: number;
      credits?: number;
      yuan?: number;
      spirit_stones?: number;
      [key: string]: number | undefined;
    };
  };
  level: number;
  experience: number;
  backstory?: string;
  relationships?: {
    npcId: string;
    name: string;
    relation: number;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface GameSession {
  id: string;
  isActive: boolean;
  startedAt: string;
  lastSavedAt?: string;
  endedAt?: string;
  currentStoryNodeId?: string;
  gameState?: {
    currentLocation: string;
    visitedLocations: string[];
    discoveredLocations: string[];
    completedQuests: string[];
    questLog: string[];
    acquiredItems: string[];
    npcRelations: Record<string, number>;
    flags: Record<string, string | number | boolean>;
    time?: {
      day: number;
      hour: number;
      minute: number;
    };
    weather?: string;
  };
  character?: Character;
  currentStoryNode?: StoryNode;
}

export interface StoryNode {
  id: string;
  content: string;
  location?: string;
  sceneDescription?: string;
  isCombatScene: boolean;
  combatData?: {
    enemies: {
      id: string;
      name: string;
      level: number;
      health: number;
      attributes: Record<string, number>;
      abilities: string[];
    }[];
    rewards: {
      experience: number;
      gold: number;
      items: {
        id: string;
        name: string;
        description?: string;
        quantity: number;
        dropChance: number;
        type?: string;
        value?: number;
        rarity?: string;
      }[];
    };
  };
  createdAt: string;
  isEnding: boolean;
  choices?: Choice[];
}

export interface Choice {
  id: string;
  content: string;
  nodeId: string;
  nextNodeId?: string;
  requiredAttribute?: string;
  requiredAttributeValue?: number;
  requiredSkill?: string;
  requiredItem?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameState {
  characters: Character[];
  sessions: GameSession[];
  currentSession: GameSession | null;
  currentNode: StoryNode | null;
  isLoading: boolean;
  error: string | null;
}
