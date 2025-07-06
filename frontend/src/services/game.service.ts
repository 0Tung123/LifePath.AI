import api from './api';
import {
  Game,
  CreateGameDto,
  CharacterLifeSummary,
  GameActionDto,
  ApiResponse,
  GameSummaryResponse,
} from '../types/shared';

class GameService {
  /**
   * Create a new game
   */
  async createGame(createGameData: CreateGameDto): Promise<Game> {
    const response = await api.post<ApiResponse<Game>>(
      '/games',
      createGameData,
    );
    return response.data.data as Game;
  }

  /**
   * Get all games for the current user
   */
  async getGames(): Promise<Game[]> {
    const response = await api.get<ApiResponse<Game[]>>('/games');
    return response.data.data as Game[];
  }

  /**
   * Get a specific game by ID
   */
  async getGameById(gameId: string): Promise<Game> {
    const response = await api.get<ApiResponse<Game>>(`/games/${gameId}`);
    return response.data.data as Game;
  }

  /**
   * Process player action in the game
   */
  async performGameAction(
    gameId: string,
    actionData: GameActionDto,
  ): Promise<Game> {
    const response = await api.post<ApiResponse<Game>>(
      `/games/${gameId}/action`,
      actionData,
    );
    return response.data.data as Game;
  }

  /**
   * Process player choice
   */
  async makeChoice(gameId: string, choiceNumber: number): Promise<Game> {
    return this.performGameAction(gameId, { choiceNumber });
  }

  /**
   * Submit a custom action for the character
   */
  async performAction(gameId: string, action: string): Promise<Game> {
    return this.performGameAction(gameId, { action });
  }

  /**
   * Submit character thoughts
   */
  async performThinking(gameId: string, think: string): Promise<Game> {
    return this.performGameAction(gameId, { think });
  }

  /**
   * Submit character communication
   */
  async performCommunication(
    gameId: string,
    communication: string,
  ): Promise<Game> {
    return this.performGameAction(gameId, { communication });
  }

  /**
   * Get story summary from AI
   */
  async getSummary(
    gameId: string,
    type: 'brief' | 'detailed' = 'brief',
  ): Promise<GameSummaryResponse> {
    const response = await api.post<ApiResponse<GameSummaryResponse>>(
      `/games/${gameId}/summary`,
      { type },
    );
    return response.data.data as GameSummaryResponse;
  }

  /**
   * Delete a game by ID
   */
  async deleteGame(gameId: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/games/${gameId}`);
      console.log(`Game ${gameId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error; // Re-throw to allow handling in the UI
    }
  }

  /**
   * Get character life summary (for death screen)
   */
  async getLifeSummary(gameId: string): Promise<CharacterLifeSummary> {
    const response = await api.get<ApiResponse<CharacterLifeSummary>>(
      `/games/${gameId}/life-summary`,
    );
    return response.data.data as CharacterLifeSummary;
  }

  /**
   * Resurrect character with penalties
   */
  async resurrectCharacter(
    gameId: string,
    acceptPenalties: boolean = true,
  ): Promise<Game> {
    const response = await api.post<ApiResponse<Game>>(
      `/games/${gameId}/resurrect`,
      { acceptPenalties },
    );
    return response.data.data as Game;
  }
}

export const gameService = new GameService();
export default gameService;
