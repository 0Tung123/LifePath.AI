// API Service - Comprehensive backend integration
// Based on backend controllers and DTOs

import {
  GameState,
  GameActionDto,
  GameActionResponse,
  GameResponse,
  GameListResponse,
  LifeSummaryResponse,
  CreateGameDto,
  GameStatistics,
} from '../types/game.types';

import {
  NPCBackendData,
  NPCUpdateRequest,
  NPCInteractionRequest,
  NPCNotificationData,
} from '../types/npc.types';

import {
  CharacterCreationSession,
  CharacterTemplate,
  BackstoryAnalysis,
  CreateCustomTemplateDto,
  SelectTemplateDto,
  AnalyzeBackstoryDto,
  AllocateStatsDto,
  FinalizeCharacterDto,
} from '../types/character-creation.types';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  // Auth methods
  setAuthToken(token: string) {
    this.token = token;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  // Game Management API
  async createGame(gameData: CreateGameDto): Promise<GameResponse> {
    return this.request<GameResponse>('/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async getGame(gameId: string): Promise<GameResponse> {
    return this.request<GameResponse>(`/games/${gameId}`);
  }

  async getAllGames(): Promise<GameListResponse> {
    return this.request<GameListResponse>('/games');
  }

  async deleteGame(gameId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/games/${gameId}`, {
      method: 'DELETE',
    });
  }

  // Game Actions API
  async performGameAction(
    gameId: string,
    action: GameActionDto,
  ): Promise<GameActionResponse> {
    return this.request<GameActionResponse>(`/games/${gameId}/action`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async getLifeSummary(gameId: string): Promise<LifeSummaryResponse> {
    return this.request<LifeSummaryResponse>(`/games/${gameId}/life-summary`);
  }

  // Character Creation API
  async getCharacterTemplates(worldType?: string): Promise<{
    success: boolean;
    data: CharacterTemplate[];
  }> {
    const params = worldType
      ? `?worldType=${encodeURIComponent(worldType)}`
      : '';
    return this.request<{
      success: boolean;
      data: CharacterTemplate[];
    }>(`/character-creation/templates${params}`);
  }

  async selectTemplate(data: SelectTemplateDto): Promise<{
    success: boolean;
    data: CharacterCreationSession;
  }> {
    return this.request<{
      success: boolean;
      data: CharacterCreationSession;
    }>('/character-creation/select-template', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeBackstory(data: AnalyzeBackstoryDto): Promise<{
    success: boolean;
    data: BackstoryAnalysis;
  }> {
    return this.request<{
      success: boolean;
      data: BackstoryAnalysis;
    }>('/character-creation/analyze-backstory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async allocateStats(data: AllocateStatsDto): Promise<{
    success: boolean;
    data: CharacterCreationSession;
  }> {
    return this.request<{
      success: boolean;
      data: CharacterCreationSession;
    }>('/character-creation/allocate-stats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async finalizeCharacter(data: FinalizeCharacterDto): Promise<{
    success: boolean;
    data: GameState;
  }> {
    return this.request<{
      success: boolean;
      data: GameState;
    }>('/character-creation/finalize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createCustomTemplate(data: CreateCustomTemplateDto): Promise<{
    success: boolean;
    data: CharacterTemplate;
  }> {
    return this.request<{
      success: boolean;
      data: CharacterTemplate;
    }>('/character-creation/create-template', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCharacterCreationSession(gameId: string): Promise<{
    success: boolean;
    data: CharacterCreationSession;
  }> {
    return this.request<{
      success: boolean;
      data: CharacterCreationSession;
    }>(`/character-creation/session/${gameId}`);
  }

  // NPC Management API
  async getNPCs(gameId: string): Promise<{
    success: boolean;
    data: NPCBackendData[];
  }> {
    return this.request<{
      success: boolean;
      data: NPCBackendData[];
    }>(`/npcs/game/${gameId}`);
  }

  async getNPC(npcId: string): Promise<{
    success: boolean;
    data: NPCBackendData;
  }> {
    return this.request<{
      success: boolean;
      data: NPCBackendData;
    }>(`/npcs/${npcId}`);
  }

  async updateNPC(
    npcId: string,
    updates: NPCUpdateRequest,
  ): Promise<{
    success: boolean;
    data: NPCBackendData;
  }> {
    return this.request<{
      success: boolean;
      data: NPCBackendData;
    }>(`/npcs/${npcId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async createNPCInteraction(data: NPCInteractionRequest): Promise<{
    success: boolean;
    data: any;
  }> {
    return this.request<{
      success: boolean;
      data: any;
    }>('/npcs/interaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getNPCInteractions(npcId: string): Promise<{
    success: boolean;
    data: any[];
  }> {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/npcs/${npcId}/interactions`);
  }

  async getNPCNotifications(gameId: string): Promise<{
    success: boolean;
    data: NPCNotificationData[];
  }> {
    return this.request<{
      success: boolean;
      data: NPCNotificationData[];
    }>(`/npcs/game/${gameId}/notifications`);
  }

  async dismissNPCNotification(notificationId: string): Promise<{
    success: boolean;
  }> {
    return this.request<{
      success: boolean;
    }>(`/npcs/notifications/${notificationId}/dismiss`, {
      method: 'PATCH',
    });
  }

  // Statistics API
  async getGameStatistics(): Promise<{
    success: boolean;
    data: GameStatistics;
  }> {
    return this.request<{
      success: boolean;
      data: GameStatistics;
    }>('/games/statistics');
  }

  // Health check
  async healthCheck(): Promise<{
    success: boolean;
    timestamp: string;
    version: string;
  }> {
    return this.request<{
      success: boolean;
      timestamp: string;
      version: string;
    }>('/health');
  }

  // Batch operations
  async batchUpdateNPCs(updates: NPCUpdateRequest[]): Promise<{
    success: boolean;
    updated: number;
    failed: number;
  }> {
    return this.request<{
      success: boolean;
      updated: number;
      failed: number;
    }>('/npcs/batch-update', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // Export/Import
  async exportGame(gameId: string): Promise<{
    success: boolean;
    data: any;
  }> {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/games/${gameId}/export`);
  }

  async importGame(gameData: any): Promise<{
    success: boolean;
    data: GameState;
  }> {
    return this.request<{
      success: boolean;
      data: GameState;
    }>('/games/import', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  // WebSocket connection for real-time updates
  createWebSocketConnection(gameId: string): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws') + `/games/${gameId}/ws`;
    return new WebSocket(wsUrl);
  }

  // File upload for character avatars, etc.
  async uploadFile(
    file: File,
    context: string,
  ): Promise<{
    success: boolean;
    url: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);

    return this.request<{
      success: boolean;
      url: string;
    }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it for FormData
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
