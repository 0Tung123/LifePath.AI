"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  gameApi,
  Character,
  GameSession,
  StoryNode,
  Choice,
  Quest,
  CharacterCreateInput,
  CharacterGenerateInput,
  UserInputData,
  GenreInfo,
  GameGenre,
} from "../api/apiClient";
import { getErrorMessage } from "../utils/errorHandler";

// Định nghĩa interface cho context
interface GameContextType {
  // Character state
  characters: Character[];
  selectedCharacter: Character | null;
  loadingCharacters: boolean;

  // Game session state
  gameSessions: GameSession[];
  currentSession: GameSession | null;
  loadingSession: boolean;

  // Game progression state
  currentNode: StoryNode | null;
  previousNodes: StoryNode[];

  // Genre state
  availableGenres: GenreInfo[];

  // Error handling
  error: string | null;

  // Character functions
  fetchCharacters: () => Promise<void>;
  fetchCharacterById: (id: string) => Promise<Character>;
  createCharacter: (data: CharacterCreateInput) => Promise<Character>;
  generateCharacter: (data: CharacterGenerateInput) => Promise<Character>;

  // Genre functions
  fetchGenres: () => Promise<void>;

  // Game session functions
  fetchGameSessions: () => Promise<void>;
  fetchGameSession: (id: string) => Promise<GameSession>;
  startNewGame: (characterId: string) => Promise<GameSession>;
  saveGame: (sessionId: string) => Promise<GameSession>;
  endGame: (sessionId: string) => Promise<GameSession>;

  // Game progression functions
  makeChoice: (choiceId: string) => Promise<void>;
  processUserInput: (inputData: UserInputData) => Promise<void>;

  // Local state management
  setSelectedCharacter: (character: Character | null) => void;
  clearGameState: () => void;
}

// Tạo context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Character state
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [loadingCharacters, setLoadingCharacters] = useState<boolean>(false);

  // Game session state
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [loadingSession, setLoadingSession] = useState<boolean>(false);

  // Game progression state
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [previousNodes, setPreviousNodes] = useState<StoryNode[]>([]);

  // Genre state
  const [availableGenres, setAvailableGenres] = useState<GenreInfo[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load available genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Character functions
  const fetchCharacters = async () => {
    try {
      setLoadingCharacters(true);
      const data = await gameApi.getCharacters();
      setCharacters(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch characters:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoadingCharacters(false);
    }
  };

  const fetchCharacterById = async (id: string): Promise<Character> => {
    try {
      setLoadingCharacters(true);
      const character = await gameApi.getCharacterById(id);
      setError(null);
      return character;
    } catch (error) {
      console.error(`Failed to fetch character with id ${id}:`, error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoadingCharacters(false);
    }
  };

  const createCharacter = async (
    data: CharacterCreateInput
  ): Promise<Character> => {
    try {
      setLoadingCharacters(true);
      const newCharacter = await gameApi.createCharacter(data);
      setCharacters((prev) => [...prev, newCharacter]);
      setError(null);
      return newCharacter;
    } catch (error) {
      console.error("Failed to create character:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoadingCharacters(false);
    }
  };

  const generateCharacter = async (
    data: CharacterGenerateInput
  ): Promise<Character> => {
    try {
      setLoadingCharacters(true);
      const newCharacter = await gameApi.generateCharacter(data);
      setCharacters((prev) => [...prev, newCharacter]);
      setError(null);
      return newCharacter;
    } catch (error) {
      console.error("Failed to generate character:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoadingCharacters(false);
    }
  };

  // Genre functions
  const fetchGenres = async () => {
    try {
      const genres = await gameApi.getAvailableGenres();
      setAvailableGenres(genres);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch genres:", error);
      setError(getErrorMessage(error));
    }
  };

  // Game session functions
  const fetchGameSessions = async () => {
    try {
      setLoadingSession(true);
      const sessions = await gameApi.getGameSessions();
      setGameSessions(sessions);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch game sessions:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoadingSession(false);
    }
  };

  const fetchGameSession = async (id: string): Promise<GameSession> => {
    try {
      setLoadingSession(true);
      const session = await gameApi.getGameSession(id);
      setCurrentSession(session);

      // Update current node and game state from session
      if (session.currentStoryNode) {
        setCurrentNode(session.currentStoryNode);
      }

      if (session.previousNodes) {
        setPreviousNodes(session.previousNodes);
      }

      setError(null);
      return session;
    } catch (error) {
      console.error(`Failed to fetch game session with id ${id}:`, error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoadingSession(false);
    }
  };

  const startNewGame = async (characterId: string): Promise<GameSession> => {
    try {
      setLoadingSession(true);
      const session = await gameApi.startNewGame(characterId);
      setCurrentSession(session);

      // Update current node from session
      if (session.currentStoryNode) {
        setCurrentNode(session.currentStoryNode);
      }

      // Reset previous nodes
      setPreviousNodes([]);

      setError(null);
      return session;
    } catch (error) {
      console.error("Failed to start new game:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoadingSession(false);
    }
  };

  const saveGame = async (sessionId: string): Promise<GameSession> => {
    try {
      setLoadingSession(true);
      const session = await gameApi.saveGame(sessionId);
      setError(null);
      return session;
    } catch (error) {
      console.error(`Failed to save game session ${sessionId}:`, error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoadingSession(false);
    }
  };

  const endGame = async (sessionId: string): Promise<GameSession> => {
    try {
      setLoadingSession(true);
      const session = await gameApi.endGame(sessionId);

      // Update current session in state if it's the active one
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(session);
      }

      setError(null);
      return session;
    } catch (error) {
      console.error(`Failed to end game session ${sessionId}:`, error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoadingSession(false);
    }
  };

  // Game progression functions
  const makeChoice = async (choiceId: string): Promise<void> => {
    if (!currentSession) {
      setError("No active game session");
      return;
    }

    try {
      setLoadingSession(true);
      const updatedSession = await gameApi.makeChoice(
        currentSession.id,
        choiceId
      );
      setCurrentSession(updatedSession);

      // Store current node in previous nodes before updating
      if (currentNode) {
        setPreviousNodes((prev) => [...prev, currentNode]);
      }

      // Update current node
      if (updatedSession.currentStoryNode) {
        setCurrentNode(updatedSession.currentStoryNode);
      }

      setError(null);
    } catch (error) {
      console.error(`Failed to make choice ${choiceId}:`, error);
      setError(getErrorMessage(error));
    } finally {
      setLoadingSession(false);
    }
  };

  const processUserInput = async (inputData: UserInputData): Promise<void> => {
    if (!currentSession) {
      setError("No active game session");
      return;
    }

    try {
      setLoadingSession(true);
      const updatedSession = await gameApi.processUserInput(
        currentSession.id,
        inputData
      );
      setCurrentSession(updatedSession);

      // Store current node in previous nodes before updating
      if (currentNode) {
        setPreviousNodes((prev) => [...prev, currentNode]);
      }

      // Update current node
      if (updatedSession.currentStoryNode) {
        setCurrentNode(updatedSession.currentStoryNode);
      }

      setError(null);
    } catch (error) {
      console.error("Failed to process user input:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoadingSession(false);
    }
  };

  // Clear game state
  const clearGameState = () => {
    setCurrentSession(null);
    setCurrentNode(null);
    setPreviousNodes([]);
    setError(null);
  };

  // Giá trị trả về cho context
  const contextValue: GameContextType = {
    // Character state
    characters,
    selectedCharacter,
    loadingCharacters,

    // Game session state
    gameSessions,
    currentSession,
    loadingSession,

    // Game progression state
    currentNode,
    previousNodes,

    // Genre state
    availableGenres,

    // Error handling
    error,

    // Character functions
    fetchCharacters,
    fetchCharacterById,
    createCharacter,
    generateCharacter,

    // Genre functions
    fetchGenres,

    // Game session functions
    fetchGameSessions,
    fetchGameSession,
    startNewGame,
    saveGame,
    endGame,

    // Game progression functions
    makeChoice,
    processUserInput,

    // Local state management
    setSelectedCharacter,
    clearGameState,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
