import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { GameState, Character, GameSession } from "@/types/game.types";
import gameService from "@/services/game.service";
import { ApiError } from "@/types/api.types";

// Initial state
const initialState: GameState = {
  characters: [],
  sessions: [],
  currentSession: null,
  currentNode: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCharacters = createAsyncThunk(
  "game/fetchCharacters",
  async (_, { rejectWithValue }) => {
    try {
      const characters = await gameService.getCharacters();
      return characters;
    } catch (error) {
      return rejectWithValue((error as ApiError).message);
    }
  }
);

export const createCharacter = createAsyncThunk(
  "game/createCharacter",
  async (characterData: Partial<Character>, { rejectWithValue }) => {
    try {
      const character = await gameService.createCharacter(characterData);
      return character;
    } catch (error) {
      return rejectWithValue((error as ApiError).message);
    }
  }
);

export const fetchGameSessions = createAsyncThunk(
  "game/fetchGameSessions",
  async (_, { rejectWithValue }) => {
    try {
      const sessions = await gameService.getGameSessions();
      return sessions;
    } catch (error) {
      return rejectWithValue((error as ApiError).message);
    }
  }
);

export const createGameSession = createAsyncThunk(
  "game/createGameSession",
  async (sessionData: Partial<GameSession>, { rejectWithValue }) => {
    try {
      const session = await gameService.createGameSession(sessionData);
      return session;
    } catch (error) {
      return rejectWithValue((error as ApiError).message);
    }
  }
);

export const fetchCurrentNode = createAsyncThunk(
  "game/fetchCurrentNode",
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const node = await gameService.getCurrentNode(sessionId);
      return node;
    } catch (error) {
      return rejectWithValue((error as ApiError).message);
    }
  }
);

export const makeChoice = createAsyncThunk(
  "game/makeChoice",
  async (choiceId: string, { rejectWithValue }) => {
    try {
      const nextNode = await gameService.makeChoice(choiceId);
      return nextNode;
    } catch (error) {
      return rejectWithValue((error as ApiError).message);
    }
  }
);

// Game slice
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<GameSession>) => {
      state.currentSession = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.currentNode = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch characters
    builder.addCase(fetchCharacters.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCharacters.fulfilled, (state, action) => {
      state.isLoading = false;
      state.characters = action.payload;
    });
    builder.addCase(fetchCharacters.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create character
    builder.addCase(createCharacter.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createCharacter.fulfilled, (state, action) => {
      state.isLoading = false;
      state.characters.push(action.payload);
    });
    builder.addCase(createCharacter.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch game sessions
    builder.addCase(fetchGameSessions.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGameSessions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sessions = action.payload;
    });
    builder.addCase(fetchGameSessions.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create game session
    builder.addCase(createGameSession.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createGameSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sessions.push(action.payload);
      state.currentSession = action.payload;
    });
    builder.addCase(createGameSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch current node
    builder.addCase(fetchCurrentNode.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentNode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentNode = action.payload;
    });
    builder.addCase(fetchCurrentNode.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Make choice
    builder.addCase(makeChoice.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(makeChoice.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentNode = action.payload;
    });
    builder.addCase(makeChoice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentSession, clearCurrentSession, clearError } =
  gameSlice.actions;

export default gameSlice.reducer;
