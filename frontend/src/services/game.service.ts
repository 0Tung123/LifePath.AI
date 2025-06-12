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

export interface Game {
  id: string;
  userId: string;
  settings: GameSettings;
  storyHistory: StorySegment[];
  characterStats: GameStats;
  inventoryItems: InventoryItem[];
  characterSkills: Skill[];
  loreFragments: LoreFragment[];
  currentPrompt: string;
  currentChoices: Choice[];
  active: boolean;
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
   * Process player choice and continue game
   * Note: This endpoint wasn't visible in the controller we examined,
   * but would be necessary for gameplay.
   */
  async makeChoice(gameId: string, choiceNumber: number): Promise<Game> {
    const response = await api.post<Game>(`/games/${gameId}/choice`, {
      choiceNumber,
    });
    return response.data;
  }
}

export const gameService = new GameService();
export default gameService;
