import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/api";
import { initializeAuthToken } from "@/utils/auth-token";

// Types
export interface Character {
  id: string;
  name: string;
  characterClass: string;
  primaryGenre: string;
  secondaryGenres?: string[];
  customGenreDescription?: string;
  attributes: Record<string, number>;
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
  inventory: {
    items: {
      id: string;
      name: string;
      description: string;
      quantity: number;
      type?: string;
      effects?: Record<string, any>;
      value?: number;
      rarity?: string;
    }[];
    currency: Record<string, number>;
  };
  level: number;
  experience: number;
  backstory?: string;
  isDead: boolean;
}

export interface Choice {
  id: string;
  text: string;
  order: number;
  requiredAttribute?: string;
  requiredAttributeValue?: number;
  requiredSkill?: string;
  requiredItem?: string;
  metadata?: {
    isCustomAction?: boolean;
    customActionType?: string;
    successProbability?: number;
    dangerLevel?: number;
    [key: string]: any;
  };
}

export interface StoryNode {
  id: string;
  content: string;
  location?: string;
  sceneDescription?: string;
  isCombatScene: boolean;
  isRoot: boolean;
  parentNodeId?: string;
  metadata?: {
    inputType?: string;
    userInput?: string;
    dangerLevel?: number;
    tags?: string[];
    mood?: string;
    [key: string]: any;
  };
  choices: Choice[];
  createdAt: string;
}

export interface GameSession {
  id: string;
  isActive: boolean;
  startedAt: string;
  updatedAt: string;
  lastSavedAt?: string;
  endedAt?: string;
  currentStoryNodeId?: string;
  currentStoryNode?: StoryNode;
  gameState?: {
    currentLocation: string;
    visitedLocations: string[];
    discoveredLocations: string[];
    completedQuests: string[];
    questLog: string[];
    acquiredItems: string[];
    npcRelations: Record<string, number>;
    flags: Record<string, any>;
    time?: {
      day: number;
      hour: number;
      minute: number;
    };
    weather?: string;
    dangerLevel: number;
    survivalChance: number;
    dangerWarnings: string[];
    nearDeathExperiences: number;
    pendingConsequences: Array<{
      id: string;
      title: string;
      triggerTime: string;
      severity: string;
      description: string;
    }>;
  };
  difficultyLevel: "easy" | "normal" | "hard" | "hardcore";
  permadeathEnabled: boolean;
  deathReason?: string;
  character?: Character;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  completionCriteria?: string;
  status: "available" | "active" | "completed" | "failed";
  type: "main" | "side" | "dynamic" | "hidden";
  rewards?: {
    experience?: number;
    gold?: number;
    items?: string[];
    other?: string;
  };
  triggers?: string[];
  relatedItems?: string[];
  relatedLocations?: string[];
  relatedNpcs?: string[];
}

export interface Legacy {
  id: string;
  characterId: string;
  characterName: string;
  deathDate: string;
  epitaph: string;
  achievements: string[];
  finalLevel: number;
  daysSurvived: number;
  storySummary: string;
  finalAttributes: Record<string, number>;
}

// Adventure log entry types
export type AdventureLogEntryType =
  | "story"
  | "choice"
  | "system"
  | "combat"
  | "quest";

export interface AdventureLogEntry {
  id: string;
  type: AdventureLogEntryType;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Game Store
interface GameState {
  // Character management
  characters: Character[];
  selectedCharacter: Character | null;

  // Game session
  currentSession: GameSession | null;
  adventureLog: AdventureLogEntry[];

  // Quests
  activeQuests: Quest[];
  completedQuests: Quest[];

  // Legacy
  legacies: Legacy[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCharacters: () => Promise<void>;
  createCharacter: (characterData: Partial<Character>) => Promise<Character>;
  generateCharacter: (
    description: string,
    genre?: string
  ) => Promise<Character>;
  selectCharacter: (characterId: string) => Promise<void>;

  startGameSession: (characterId: string) => Promise<void>;
  makeChoice: (choiceId: string) => Promise<void>;
  submitCustomInput: (
    type: string,
    content: string,
    target?: string
  ) => Promise<void>;
  endGameSession: () => Promise<void>;

  fetchQuests: () => Promise<void>;

  fetchLegacies: () => Promise<void>;
  viewLegacy: (legacyId: string) => Promise<Legacy>;

  clearError: () => void;
  resetGameState: () => void;

  // Adventure log management
  addToAdventureLog: (
    entry: Omit<AdventureLogEntry, "id" | "timestamp">
  ) => void;
  clearAdventureLog: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // State
      characters: [],
      selectedCharacter: null,
      currentSession: null,
      adventureLog: [],
      activeQuests: [],
      completedQuests: [],
      legacies: [],
      isLoading: false,
      error: null,

      // Actions
      fetchCharacters: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Ensure token is set
          initializeAuthToken();
          
          console.log("👤 [GAME-STORE-FETCH] Fetching characters", {
            timestamp: new Date().toISOString()
          });
          
          const response = await api.get("/game/characters");
          
          console.log("✅ [GAME-STORE-FETCH-SUCCESS] Characters fetched successfully", {
            count: response.data.length,
            timestamp: new Date().toISOString()
          });
          
          set({ characters: response.data, isLoading: false });
        } catch (error: any) {
          console.error("❌ [GAME-STORE-FETCH-ERROR] Failed to fetch characters", {
            status: error.response?.status,
            message: error.response?.data?.message,
            url: error.config?.url,
            timestamp: new Date().toISOString()
          });
          
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to fetch characters",
          });
          throw error;
        }
      },

      createCharacter: async (characterData: Partial<Character>) => {
        try {
          set({ isLoading: true, error: null });
          
          // Ensure token is set
          initializeAuthToken();
          
          console.log("GameStore: Creating character", characterData);
          const response = await api.post("/game/characters", characterData);
          const newCharacter = response.data;
          console.log("GameStore: Character created successfully", newCharacter.id);

          set((state) => ({
            characters: [...state.characters, newCharacter],
            isLoading: false,
          }));

          return newCharacter;
        } catch (error: any) {
          console.error("GameStore: Failed to create character", error.response?.status, error.response?.data);
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to create character",
          });
          throw error;
        }
      },

      generateCharacter: async (description: string, primaryGenre?: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Ensure token is set
          initializeAuthToken();
          
          console.log("GameStore: Generating character", { description, primaryGenre });
          const response = await api.post("/game/characters/generate", {
            description,
            primaryGenre,
          });
          const newCharacter = response.data;
          console.log("GameStore: Character generated successfully", newCharacter.id);

          set((state) => ({
            characters: [...state.characters, newCharacter],
            isLoading: false,
          }));

          return newCharacter;
        } catch (error: any) {
          console.error("GameStore: Failed to generate character", error.response?.status, error.response?.data);
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to generate character",
          });
          throw error;
        }
      },

      selectCharacter: async (characterId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Ensure token is set
          initializeAuthToken();
          
          console.log("GameStore: Selecting character", characterId);
          const character = get().characters.find((c) => c.id === characterId);

          if (!character) {
            console.log("GameStore: Character not found in store, fetching from API");
            const response = await api.get(`/game/characters/${characterId}`);
            console.log("GameStore: Character fetched successfully", response.data);
            set({ selectedCharacter: response.data, isLoading: false });
          } else {
            console.log("GameStore: Character found in store");
            set({ selectedCharacter: character, isLoading: false });
          }
        } catch (error: any) {
          console.error("GameStore: Failed to select character", error.response?.status, error.response?.data);
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to select character",
          });
          throw error;
        }
      },

      startGameSession: async (characterId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Ensure token is set
          initializeAuthToken();
          
          console.log("🎲 [GAME-SESSION-START] Starting game session", {
            characterId,
            timestamp: new Date().toISOString()
          });
          
          // Add request timestamp for tracking request duration
          const requestStartTime = Date.now();
          
          const response = await api.post("/game/sessions", { characterId });
          const session = response.data;
          
          const requestDuration = Date.now() - requestStartTime;
          
          console.log("✅ [GAME-SESSION-SUCCESS] Game session started successfully", {
            sessionId: session.id,
            characterId,
            requestDurationMs: requestDuration,
            timestamp: new Date().toISOString()
          });

          // Initialize adventure log with the first story node
          const initialLogEntry: Omit<AdventureLogEntry, "id" | "timestamp"> = {
            type: "story",
            content:
              session.currentStoryNode?.content || "Your adventure begins...",
            metadata: {
              nodeId: session.currentStoryNode?.id,
              location: session.currentStoryNode?.location,
            },
          };

          set({
            currentSession: session,
            isLoading: false,
            adventureLog: [
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                ...initialLogEntry,
              },
            ],
          });

          // Add system message
          get().addToAdventureLog({
            type: "system",
            content: "Game session started",
          });
          
          console.log("📝 [GAME-LOG-INIT] Adventure log initialized", {
            firstNodeId: session.currentStoryNode?.id,
            timestamp: new Date().toISOString()
          });
        } catch (error: any) {
          console.error("❌ [GAME-SESSION-ERROR] Failed to start game session", {
            characterId,
            status: error.response?.status,
            message: error.response?.data?.message,
            url: error.config?.url,
            timestamp: new Date().toISOString()
          });
          
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to start game session",
          });
          throw error;
        }
      },

      makeChoice: async (choiceId: string) => {
        try {
          const { currentSession } = get();
          if (!currentSession) {
            console.error("❌ [GAME-CHOICE-ERROR] No active game session", {
              timestamp: new Date().toISOString()
            });
            throw new Error("No active game session");
          }

          set({ isLoading: true, error: null });
          
          console.log("🎲 [GAME-CHOICE] Making choice in game session", {
            sessionId: currentSession.id,
            choiceId,
            timestamp: new Date().toISOString()
          });

          // Find the choice text to add to adventure log
          const choice = currentSession.currentStoryNode?.choices.find(
            (c) => c.id === choiceId
          );
          if (choice) {
            console.log("📝 [GAME-LOG-CHOICE] Adding choice to adventure log", {
              choiceId,
              choiceText: choice.text,
              timestamp: new Date().toISOString()
            });
            
            get().addToAdventureLog({
              type: "choice",
              content: choice.text,
              metadata: { choiceId },
            });
          }

          // Add request timestamp for tracking request duration
          const requestStartTime = Date.now();
          
          const response = await api.post(
            `/game/sessions/${currentSession.id}/choices/${choiceId}`
          );
          const updatedSession = response.data;
          
          const requestDuration = Date.now() - requestStartTime;
          
          console.log("✅ [GAME-CHOICE-SUCCESS] Choice processed successfully", {
            sessionId: currentSession.id,
            choiceId,
            newNodeId: updatedSession.currentStoryNode?.id,
            requestDurationMs: requestDuration,
            timestamp: new Date().toISOString()
          });

          // Add new story node to adventure log
          if (updatedSession.currentStoryNode) {
            console.log("📝 [GAME-LOG-STORY] Adding new story node to adventure log", {
              nodeId: updatedSession.currentStoryNode.id,
              timestamp: new Date().toISOString()
            });
            
            get().addToAdventureLog({
              type: "story",
              content: updatedSession.currentStoryNode.content,
              metadata: {
                nodeId: updatedSession.currentStoryNode.id,
                location: updatedSession.currentStoryNode.location,
              },
            });
          }

          set({
            currentSession: updatedSession,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("❌ [GAME-CHOICE-ERROR] Failed to make choice", {
            sessionId: get().currentSession?.id,
            choiceId,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url,
            timestamp: new Date().toISOString()
          });
          
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to make choice",
          });
          throw error;
        }
      },

      submitCustomInput: async (
        type: string,
        content: string,
        target?: string
      ) => {
        try {
          const { currentSession } = get();
          if (!currentSession) throw new Error("No active game session");

          set({ isLoading: true, error: null });

          // Add user input to adventure log
          get().addToAdventureLog({
            type: "choice",
            content: `[${type}] ${content}`,
            metadata: { inputType: type, target },
          });

          const response = await api.post(
            `/game/sessions/${currentSession.id}/input`,
            {
              type,
              content,
              target,
            }
          );

          const updatedSession = response.data;

          // Add new story node to adventure log
          if (updatedSession.currentStoryNode) {
            get().addToAdventureLog({
              type: "story",
              content: updatedSession.currentStoryNode.content,
              metadata: {
                nodeId: updatedSession.currentStoryNode.id,
                location: updatedSession.currentStoryNode.location,
              },
            });
          }

          set({
            currentSession: updatedSession,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to submit input",
          });
          throw error;
        }
      },

      endGameSession: async () => {
        try {
          const { currentSession } = get();
          if (!currentSession) throw new Error("No active game session");

          set({ isLoading: true, error: null });

          await api.put(`/game/sessions/${currentSession.id}/end`);

          set({
            currentSession: null,
            isLoading: false,
          });

          get().clearAdventureLog();
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to end game session",
          });
          throw error;
        }
      },

      fetchQuests: async () => {
        try {
          const { currentSession } = get();
          if (!currentSession) throw new Error("No active game session");

          set({ isLoading: true, error: null });

          // This endpoint would need to be implemented in the backend
          const response = await api.get(
            `/game/sessions/${currentSession.id}/quests`
          );

          const quests = response.data;
          const activeQuests = quests.filter(
            (q: Quest) => q.status === "active" || q.status === "available"
          );
          const completedQuests = quests.filter(
            (q: Quest) => q.status === "completed" || q.status === "failed"
          );

          set({
            activeQuests,
            completedQuests,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to fetch quests",
          });
          throw error;
        }
      },

      fetchLegacies: async () => {
        try {
          set({ isLoading: true, error: null });

          // This endpoint would need to be implemented in the backend
          const response = await api.get("/game/legacies");

          set({
            legacies: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to fetch legacies",
          });
          throw error;
        }
      },

      viewLegacy: async (legacyId: string) => {
        try {
          set({ isLoading: true, error: null });

          // This endpoint would need to be implemented in the backend
          const response = await api.get(`/game/legacies/${legacyId}`);

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to view legacy",
          });
          throw error;
        }
      },

      addToAdventureLog: (entry) => {
        set((state) => ({
          adventureLog: [
            ...state.adventureLog,
            {
              id: `log-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              timestamp: new Date().toISOString(),
              ...entry,
            },
          ],
        }));
      },

      clearAdventureLog: () => {
        set({ adventureLog: [] });
      },

      clearError: () => {
        set({ error: null });
      },

      resetGameState: () => {
        set({
          currentSession: null,
          adventureLog: [],
          activeQuests: [],
          completedQuests: [],
        });
      },
    }),
    {
      name: "game-storage",
      partialize: (state) => ({
        characters: state.characters,
        selectedCharacter: state.selectedCharacter,
        legacies: state.legacies,
      }),
    }
  )
);
