// Game State Hook - Type-safe game management
// Based on backend types and API service

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  GameActionDto,
  GameUIState,
  ParsedGameContent,
  validateGameAction,
} from '../types/game.types';
import { apiService } from '../services/api.service';

export interface UseGameStateOptions {
  gameId: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  enableWebSocket?: boolean;
}

export interface UseGameStateReturn {
  // Game state
  gameState: GameState | null;
  uiState: GameUIState;

  // Actions
  performAction: (action: GameActionDto) => Promise<void>;
  selectChoice: (choiceNumber: number) => Promise<void>;
  customAction: (action: string) => Promise<void>;
  thinkAction: (thought: string) => Promise<void>;
  communicateAction: (message: string) => Promise<void>;

  // UI state management
  setActionMode: (mode: GameUIState['actionMode']) => void;
  setSelectedTab: (tab: GameUIState['selectedTab']) => void;
  togglePanel: (
    panel: 'inventory' | 'character' | 'lore' | 'npcs' | 'achievements',
  ) => void;
  setActionInput: (input: string) => void;
  setThinkingInput: (input: string) => void;
  setCommunicationInput: (input: string) => void;

  // Utility
  isLoading: boolean;
  error: string | null;
  canPerformAction: boolean;
  refreshGameState: () => Promise<void>;

  // WebSocket
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const useGameState = (
  options: UseGameStateOptions,
): UseGameStateReturn => {
  const {
    gameId,
    autoSave = true,
    autoSaveInterval = 30000,
    enableWebSocket = true,
  } = options;

  // State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [uiState, setUIState] = useState<GameUIState>({
    isLoading: false,
    showInventory: false,
    showCharacterSheet: false,
    showLoreBook: false,
    showNPCPanel: false,
    showAchievements: false,
    selectedTab: 'story',
    actionInput: '',
    selectedChoice: undefined,
    thinkingInput: '',
    communicationInput: '',
    actionMode: 'choice',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date>(new Date());

  // Load initial game state
  useEffect(() => {
    const loadGameState = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.getGame(gameId);
        if (response.success && response.data) {
          setGameState(response.data);
          setUIState((prev) => ({ ...prev, gameState: response.data }));
        } else {
          setError(response.message || 'Failed to load game');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      loadGameState();
    }
  }, [gameId]);

  // WebSocket connection
  useEffect(() => {
    if (!enableWebSocket || !gameId || !gameState) return;

    const connectWebSocket = () => {
      setConnectionStatus('connecting');

      try {
        const ws = apiService.createWebSocketConnection(gameId);

        ws.onopen = () => {
          setConnectionStatus('connected');
          setIsConnected(true);
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setConnectionStatus('disconnected');
          setIsConnected(false);
          console.log('WebSocket disconnected');

          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (wsRef.current === ws) {
              connectWebSocket();
            }
          }, 3000);
        };

        ws.onerror = (error) => {
          setConnectionStatus('error');
          setIsConnected(false);
          console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
      } catch (err) {
        setConnectionStatus('error');
        console.error('Failed to create WebSocket connection:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enableWebSocket, gameId, gameState]);

  // Auto-save mechanism
  useEffect(() => {
    if (!autoSave || !gameState) return;

    const scheduleAutoSave = () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }

      autoSaveRef.current = setTimeout(() => {
        const timeSinceLastSave = Date.now() - lastSaveRef.current.getTime();
        if (timeSinceLastSave >= autoSaveInterval) {
          // Auto-save logic would go here
          console.log('Auto-saving game state...');
          lastSaveRef.current = new Date();
        }
      }, autoSaveInterval);
    };

    scheduleAutoSave();

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, gameState]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'game_update') {
      setGameState((prev) => ({ ...prev, ...data.payload }));
    } else if (data.type === 'npc_update') {
      // Handle NPC updates
      console.log('NPC update received:', data.payload);
    } else if (data.type === 'error') {
      setError(data.message);
    }
  }, []);

  // Action handlers
  const performAction = useCallback(
    async (action: GameActionDto) => {
      if (!gameState || !validateGameAction(action)) {
        setError('Invalid action');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.performGameAction(gameId, action);

        if (response.success && response.data) {
          // Update game state with new content
          updateGameStateFromParsedContent(response.data);

          // Clear input fields
          setUIState((prev) => ({
            ...prev,
            actionInput: '',
            thinkingInput: '',
            communicationInput: '',
            selectedChoice: undefined,
          }));
        } else {
          setError(response.message || 'Action failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [gameState, gameId],
  );

  const selectChoice = useCallback(
    async (choiceNumber: number) => {
      await performAction({ choiceNumber });
    },
    [performAction],
  );

  const customAction = useCallback(
    async (action: string) => {
      await performAction({ action });
    },
    [performAction],
  );

  const thinkAction = useCallback(
    async (thought: string) => {
      await performAction({ think: thought });
    },
    [performAction],
  );

  const communicateAction = useCallback(
    async (message: string) => {
      await performAction({ communication: message });
    },
    [performAction],
  );

  // UI state management
  const setActionMode = useCallback((mode: GameUIState['actionMode']) => {
    setUIState((prev) => ({ ...prev, actionMode: mode }));
  }, []);

  const setSelectedTab = useCallback((tab: GameUIState['selectedTab']) => {
    setUIState((prev) => ({ ...prev, selectedTab: tab }));
  }, []);

  const togglePanel = useCallback(
    (panel: 'inventory' | 'character' | 'lore' | 'npcs' | 'achievements') => {
      setUIState((prev) => {
        const panelKey =
          `show${panel.charAt(0).toUpperCase() + panel.slice(1)}` as keyof GameUIState;

        // Safely get the current value, defaulting to false if undefined
        const currentValue = Boolean(prev[panelKey]);

        return {
          ...prev,
          [panelKey]: !currentValue,
        };
      });
    },
    [],
  );

  const setActionInput = useCallback((input: string) => {
    setUIState((prev) => ({ ...prev, actionInput: input }));
  }, []);

  const setThinkingInput = useCallback((input: string) => {
    setUIState((prev) => ({ ...prev, thinkingInput: input }));
  }, []);

  const setCommunicationInput = useCallback((input: string) => {
    setUIState((prev) => ({ ...prev, communicationInput: input }));
  }, []);

  // Utility functions
  const updateGameStateFromParsedContent = useCallback(
    (content: ParsedGameContent) => {
      setGameState((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          storyHistory: [
            ...prev.storyHistory,
            {
              type: 'story',
              content: content.storyText,
              timestamp: new Date(),
            },
          ],
          characterStats: { ...prev.characterStats, ...content.stats },
          inventoryItems: content.inventory || prev.inventoryItems,
          characterSkills: content.skills || prev.characterSkills,
          loreFragments: [...prev.loreFragments, ...content.lore],
          currentChoices: content.choices || prev.currentChoices,
          karmaScore: content.karmaChange
            ? prev.karmaScore + content.karmaChange
            : prev.karmaScore,
          reputation: content.reputationChanges
            ? { ...prev.reputation, ...content.reputationChanges }
            : prev.reputation,
          npcsMet: content.npcsMet
            ? [...(prev.npcsMet || []), ...content.npcsMet]
            : prev.npcsMet,
          itemsUsed: content.itemsUsed
            ? [...(prev.itemsUsed || []), ...content.itemsUsed]
            : prev.itemsUsed,
          importantEvents: content.importantEvents
            ? [...(prev.importantEvents || []), ...content.importantEvents]
            : prev.importantEvents,
          achievements: content.achievements
            ? [...(prev.achievements || []), ...content.achievements]
            : prev.achievements,
          deathCause: content.deathCause || prev.deathCause,
          active: !content.deathCause,
          updatedAt: new Date(),
        };
      });
    },
    [],
  );

  const refreshGameState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getGame(gameId);
      if (response.success && response.data) {
        setGameState(response.data);
      } else {
        setError(response.message || 'Failed to refresh game state');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Computed properties
  const canPerformAction = !isLoading && gameState?.active && !error;

  return {
    gameState,
    uiState,
    performAction,
    selectChoice,
    customAction,
    thinkAction,
    communicateAction,
    setActionMode,
    setSelectedTab,
    togglePanel,
    setActionInput,
    setThinkingInput,
    setCommunicationInput,
    isLoading,
    error,
    canPerformAction,
    refreshGameState,
    isConnected,
    connectionStatus,
  };
};
