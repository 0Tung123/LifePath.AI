import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

interface Character {
  id: string;
  name: string;
  age: number;
  background: string;
  primaryGenre: string;
  appearance: string;
  strength: number;
  intelligence: number;
  charisma: number;
  luck: number;
  healthMax: number;
  healthCurrent: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface StoryNode {
  id: string;
  content: string;
  gameSessionId: string;
  createdAt: string;
}

interface Choice {
  id: string;
  text: string;
  storyNodeId: string;
  selected: boolean;
}

interface GameSession {
  id: string;
  characterId: string;
  userId: string;
  active: boolean;
  character: Character;
  nodes: StoryNode[];
  choices: Choice[];
  createdAt: string;
  updatedAt: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  reward: string;
  gameSessionId: string;
  createdAt: string;
  updatedAt: string;
}

interface GameState {
  characters: Character[];
  currentCharacter: Character | null;
  gameSessions: GameSession[];
  currentSession: GameSession | null;
  quests: Quest[];
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  characters: [],
  currentCharacter: null,
  gameSessions: [],
  currentSession: null,
  quests: [],
  loading: false,
  error: null,
};

// Async thunks for Characters
export const fetchCharacters = createAsyncThunk(
  'game/fetchCharacters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Character[]>('/game/characters');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch characters');
    }
  }
);

export const createCharacter = createAsyncThunk(
  'game/createCharacter',
  async (characterData: Partial<Character>, { rejectWithValue }) => {
    try {
      const response = await api.post<Character>('/game/characters', characterData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create character');
    }
  }
);

export const generateCharacter = createAsyncThunk(
  'game/generateCharacter',
  async (prompt: string, { rejectWithValue }) => {
    try {
      const response = await api.post<Character>('/game/characters/generate', { prompt });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate character');
    }
  }
);

// Async thunks for Game Sessions
export const fetchGameSessions = createAsyncThunk(
  'game/fetchGameSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<GameSession[]>('/game/sessions');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch game sessions');
    }
  }
);

export const createGameSession = createAsyncThunk(
  'game/createGameSession',
  async (characterId: string, { rejectWithValue }) => {
    try {
      const response = await api.post<GameSession>('/game/sessions', { characterId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create game session');
    }
  }
);

export const fetchGameSession = createAsyncThunk(
  'game/fetchGameSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<GameSession>(`/game/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch game session');
    }
  }
);

export const makeChoice = createAsyncThunk(
  'game/makeChoice',
  async ({ sessionId, choiceId }: { sessionId: string; choiceId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<GameSession>(`/game/sessions/${sessionId}/choices/${choiceId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to make choice');
    }
  }
);

export const sendCustomInput = createAsyncThunk(
  'game/sendCustomInput',
  async ({ sessionId, input }: { sessionId: string; input: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<GameSession>(`/game/sessions/${sessionId}/input`, { input });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send custom input');
    }
  }
);

// Async thunks for Quests
export const fetchQuests = createAsyncThunk(
  'game/fetchQuests',
  async (gameSessionId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Quest[]>(`/game/quests/session/${gameSessionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quests');
    }
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentCharacter: (state, action: PayloadAction<Character>) => {
      state.currentCharacter = action.payload;
    },
    clearCurrentCharacter: (state) => {
      state.currentCharacter = null;
    },
    setCurrentSession: (state, action: PayloadAction<GameSession>) => {
      state.currentSession = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Characters reducers
      .addCase(fetchCharacters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload;
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(createCharacter.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.loading = false;
        state.characters.push(action.payload);
        state.currentCharacter = action.payload;
      })
      .addCase(createCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(generateCharacter.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateCharacter.fulfilled, (state, action) => {
        state.loading = false;
        state.characters.push(action.payload);
        state.currentCharacter = action.payload;
      })
      .addCase(generateCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Game Sessions reducers
      .addCase(fetchGameSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGameSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.gameSessions = action.payload;
      })
      .addCase(fetchGameSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(createGameSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGameSession.fulfilled, (state, action) => {
        state.loading = false;
        state.gameSessions.push(action.payload);
        state.currentSession = action.payload;
      })
      .addCase(createGameSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchGameSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGameSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchGameSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(makeChoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(makeChoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(makeChoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(sendCustomInput.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendCustomInput.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(sendCustomInput.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Quests reducers
      .addCase(fetchQuests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        state.loading = false;
        state.quests = action.payload;
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentCharacter, clearCurrentCharacter, setCurrentSession, clearCurrentSession } = gameSlice.actions;
export default gameSlice.reducer;