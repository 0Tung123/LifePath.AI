"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import gameService, {
  Game,
  CreateGameDto,
  GameSettings,
} from "../services/game.service";

interface GameContextType {
  currentGame: Game | null;
  isLoading: boolean;
  error: string | null;
  createGame: (settings: GameSettings) => Promise<Game>;
  loadGame: (gameId: string) => Promise<void>;
  makeChoice: (choiceNumber: number) => Promise<void>;
  performAction: (action: string) => Promise<void>;
  performThinking: (think: string) => Promise<void>;
  performCommunication: (communication: string) => Promise<void>;
  getSummary: () => Promise<string>;
  clearError: () => void;
}

interface GameProviderProps {
  children: ReactNode;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = useCallback(
    async (gameSettings: GameSettings): Promise<Game> => {
      setIsLoading(true);
      setError(null);

      try {
        const createGameDto: CreateGameDto = { gameSettings };
        const game = await gameService.createGame(createGameDto);
        setCurrentGame(game);
        return game;
      } catch (err) {
        const errorMessage = "Failed to create game. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadGame = useCallback(async (gameId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const game = await gameService.getGameById(gameId);
      setCurrentGame(game);
    } catch (err) {
      const errorMessage = "Failed to load game. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const makeChoice = useCallback(
    async (choiceNumber: number): Promise<void> => {
      if (!currentGame) {
        setError("No active game found");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedGame = await gameService.makeChoice(
          currentGame.id,
          choiceNumber
        );
        setCurrentGame(updatedGame);
      } catch (err) {
        const errorMessage = "Failed to process choice. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentGame]
  );

  const performAction = useCallback(
    async (action: string): Promise<void> => {
      if (!currentGame) {
        setError("No active game found");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedGame = await gameService.performAction(
          currentGame.id,
          action
        );
        setCurrentGame(updatedGame);
      } catch (err) {
        const errorMessage = "Failed to process action. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentGame]
  );

  const performThinking = useCallback(
    async (think: string): Promise<void> => {
      if (!currentGame) {
        setError("No active game found");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedGame = await gameService.performThinking(
          currentGame.id,
          think
        );
        setCurrentGame(updatedGame);
      } catch (err) {
        const errorMessage = "Failed to process thinking. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentGame]
  );

  const performCommunication = useCallback(
    async (communication: string): Promise<void> => {
      if (!currentGame) {
        setError("No active game found");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedGame = await gameService.performCommunication(
          currentGame.id,
          communication
        );
        setCurrentGame(updatedGame);
      } catch (err) {
        const errorMessage = "Failed to process communication. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentGame]
  );

  const getSummary = useCallback(async (): Promise<string> => {
    if (!currentGame) {
      setError("No active game found");
      throw new Error("No active game found");
    }

    setIsLoading(true);
    setError(null);

    try {
      const summary = await gameService.getSummary(currentGame.id);
      return summary;
    } catch (err) {
      const errorMessage = "Failed to get summary. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentGame]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    currentGame,
    isLoading,
    error,
    createGame,
    loadGame,
    makeChoice,
    performAction,
    performThinking,
    performCommunication,
    getSummary,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export default GameContext;
