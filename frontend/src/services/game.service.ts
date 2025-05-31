import apiService from "./api";
import { Character, GameSession, StoryNode } from "@/types/game.types";

/**
 * Game service for handling game-related API calls
 */
class GameService {
  /**
   * Get all characters for the current user
   */
  async getCharacters(): Promise<Character[]> {
    return apiService.get("/game/characters");
  }

  /**
   * Get a character by ID
   */
  async getCharacter(id: string): Promise<Character> {
    return apiService.get(`/game/characters/${id}`);
  }

  /**
   * Create a new character
   */
  async createCharacter(characterData: Partial<Character>): Promise<Character> {
    return apiService.post("/game/characters", characterData);
  }

  /**
   * Update a character
   */
  async updateCharacter(
    id: string,
    characterData: Partial<Character>
  ): Promise<Character> {
    return apiService.put(`/game/characters/${id}`, characterData);
  }

  /**
   * Delete a character
   */
  async deleteCharacter(id: string): Promise<{ success: boolean }> {
    return apiService.delete(`/game/characters/${id}`);
  }

  /**
   * Get all game sessions for the current user
   */
  async getGameSessions(): Promise<GameSession[]> {
    return apiService.get("/game/sessions");
  }

  /**
   * Get a game session by ID
   */
  async getGameSession(id: string): Promise<GameSession> {
    return apiService.get(`/game/sessions/${id}`);
  }

  /**
   * Create a new game session
   */
  async createGameSession(
    sessionData: Partial<GameSession>
  ): Promise<GameSession> {
    return apiService.post("/game/sessions", sessionData);
  }

  /**
   * Update a game session
   */
  async updateGameSession(
    id: string,
    sessionData: Partial<GameSession>
  ): Promise<GameSession> {
    return apiService.put(`/game/sessions/${id}`, sessionData);
  }

  /**
   * Delete a game session
   */
  async deleteGameSession(id: string): Promise<{ success: boolean }> {
    return apiService.delete(`/game/sessions/${id}`);
  }

  /**
   * Get a story node by ID
   */
  async getStoryNode(id: string): Promise<StoryNode> {
    return apiService.get(`/game/nodes/${id}`);
  }

  /**
   * Get the current story node for a session
   */
  async getCurrentNode(sessionId: string): Promise<StoryNode> {
    return apiService.get(`/game/sessions/${sessionId}/current-node`);
  }

  /**
   * Make a choice in the game
   */
  async makeChoice(choiceId: string): Promise<StoryNode> {
    return apiService.post(`/game/choices/${choiceId}/select`);
  }
}

// Create a singleton instance
const gameService = new GameService();

export default gameService;
