import api from "./api";

// Game types
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
  type: "npc" | "item" | "location" | "general";
  name?: string;
  title?: string;
  description?: string;
  content?: string;
}

export interface Choice {
  text: string;
  number: number;
}

export interface StorySegment {
  text: string;
  timestamp: string;
}

export interface StoryHistoryItem {
  type:
    | "story"
    | "user_choice"
    | "user_custom_action"
    | "user_thinking"
    | "user_communication"
    | "system";
  content: string;
  timestamp: string;
}

export interface ChatHistoryItem {
  role: "user" | "model";
  content: string;
}

export interface KnowledgeBaseItem {
  type: "npc" | "item" | "location" | "general";
  name: string;
  description: string;
  [key: string]: string | number | boolean | object | undefined;
}

export interface Game {
  id: string;
  userId: string;
  settings: GameSettings;
  storyHistory: StoryHistoryItem[];
  chatHistoryForGemini: ChatHistoryItem[];
  characterStats: GameStats;
  inventoryItems: InventoryItem[];
  characterSkills: Skill[];
  loreFragments: LoreFragment[];
  knowledgeBase: KnowledgeBaseItem[];
  currentPrompt: string;
  currentChoices: Choice[];
  currentObjective: string;
  npcsMet?: {
    name: string;
    description: string;
    firstMet: string;
    interactions: number;
  }[];
  itemsUsed?: {
    name: string;
    description: string;
    usedAt: string;
    quantity: number;
  }[];
  importantEvents?: {
    title: string;
    description: string;
    timestamp: string;
    type: string;
  }[];
  achievements?: { name: string; description: string; unlockedAt: string }[];
  karmaScore: number;
  reputation?: { [key: string]: number };
  active: boolean;
  deathDate?: string;
  deathCause?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalSettings {
  style?: string;
  difficulty?: string;
  gameLength?: string;
  combatStyle?: string;
  [key: string]: string | number | boolean | object | undefined;
}

export interface GameSettings {
  theme: string;
  setting: string;
  characterName: string;
  characterBackstory: string;
  additionalSettings?: AdditionalSettings;
}

export interface CreateGameDto {
  gameSettings: GameSettings;
}

export interface CharacterLifeSummary {
  characterName: string;
  theme: string;
  setting: string;
  birthDate: string;
  deathDate: string;
  deathCause: string;
  playTime: string;
  finalStats: GameStats;
  inventory: InventoryItem[];
  skills: Skill[];
  npcsMet: { name: string; description: string }[];
  importantEvents: { description: string; timestamp: string }[];
  totalChapters: number;
  achievements: { name: string; description: string; unlockedAt: string }[];
  karmaScore: number;
  reputation?: { [key: string]: number };
}

class GameService {
  /**
   * Create a new game
   */
  async createGame(createGameData: CreateGameDto): Promise<Game> {
    const response = await api.post<Game>("/games", createGameData);
    return response.data;
  }

  /**
   * Get all games for the current user
   */
  async getGames(): Promise<Game[]> {
    const response = await api.get<Game[]>("/games");
    return response.data;
  }

  /**
   * Get a specific game by ID
   */
  async getGameById(gameId: string): Promise<Game> {
    const response = await api.get<Game>(`/games/${gameId}`);
    return response.data;
  }

  /**
   * Process player action in the game (choice, action, think, communication)
   */
  async makeChoice(gameId: string, choiceNumber: number): Promise<Game> {
    const response = await api.post<Game>(`/games/${gameId}/action`, {
      choiceNumber,
    });
    return response.data;
  }

  /**
   * Submit a custom action for the character
   */
  async performAction(gameId: string, action: string): Promise<Game> {
    const response = await api.post<Game>(`/games/${gameId}/action`, {
      action,
    });
    return response.data;
  }

  /**
   * Submit character thoughts
   */
  async performThinking(gameId: string, think: string): Promise<Game> {
    const response = await api.post<Game>(`/games/${gameId}/action`, {
      think,
    });
    return response.data;
  }

  /**
   * Submit character communication
   */
  async performCommunication(
    gameId: string,
    communication: string
  ): Promise<Game> {
    const response = await api.post<Game>(`/games/${gameId}/action`, {
      communication,
    });
    return response.data;
  }

  /**
   * Get story summary from AI
   */
  async getSummary(gameId: string): Promise<string> {
    const response = await api.post<{ summary: string }>(
      `/games/${gameId}/summary`
    );
    return response.data.summary;
  }

  /**
   * Delete a game by ID
   */
  async deleteGame(gameId: string): Promise<void> {
    try {
      await api.delete(`/games/${gameId}`);
      console.log(`Game ${gameId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error; // Re-throw to allow handling in the UI
    }
  }

  /**
   * Get character life summary (for death screen)
   */
  async getLifeSummary(gameId: string): Promise<CharacterLifeSummary> {
    const response = await api.get<CharacterLifeSummary>(
      `/games/${gameId}/life-summary`
    );
    return response.data;
  }

  /**
   * Resurrect character with penalties
   */
  async resurrectCharacter(gameId: string): Promise<Game> {
    const response = await api.post<Game>(`/games/${gameId}/resurrect`);
    return response.data;
  }
}

export const gameService = new GameService();
export default gameService;
