import api from '../utils/api';

// Define interfaces for your API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

// User-related interfaces and API calls
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ access_token: string }> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (credentials: RegisterCredentials): Promise<{ message: string; user: User }> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },
  
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },
  
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
  
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    // Tokens are handled client-side, so no backend call needed
  },
  
  googleLogin: (): void => {
    // Redirect to Google login endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },
  
  handleGoogleCallback: (token: string): void => {
    localStorage.setItem('token', token);
    // Redirect to home page or dashboard
    window.location.href = '/dashboard';
  }
};

// Add other API modules (game, user, etc.) as needed
// For example:

// Game interfaces
export enum GameGenre {
  FANTASY = 'fantasy',
  MODERN = 'modern',
  SCIFI = 'scifi',
  XIANXIA = 'xianxia',
  WUXIA = 'wuxia',
  HORROR = 'horror',
  CYBERPUNK = 'cyberpunk',
  STEAMPUNK = 'steampunk',
  POSTAPOCALYPTIC = 'postapocalyptic',
  HISTORICAL = 'historical',
}

export interface GenreInfo {
  id: string;
  name: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  userId: string;
  description: string;
  backstory?: string;
  traits?: string[];
  abilities?: string[];
  primaryGenre: GameGenre;
  secondaryGenres?: GameGenre[];
  customGenreDescription?: string;
  level: number;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryNode {
  id: string;
  content: string;
  image?: string;
  choices: Choice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Choice {
  id: string;
  text: string;
  consequence?: string;
  storyNodeId: string;
  nextNodeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  reward?: string;
  gameSessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSession {
  id: string;
  characterId: string;
  character?: Character;
  currentStoryNodeId?: string;
  currentStoryNode?: StoryNode;
  previousNodes?: StoryNode[];
  quests?: Quest[];
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterCreateInput {
  name: string;
  description: string;
  backstory?: string;
  traits?: string[];
  abilities?: string[];
  primaryGenre: GameGenre;
  secondaryGenres?: GameGenre[];
  customGenreDescription?: string;
}

export interface CharacterGenerateInput {
  description: string;
  primaryGenre?: GameGenre;
  secondaryGenres?: GameGenre[];
  customGenreDescription?: string;
}

export interface UserInputData {
  type: string;  // 'choice', 'command', 'dialog', etc.
  content: string;
  target?: string;
}

export const gameApi = {
  // Character endpoints
  createCharacter: async (characterData: CharacterCreateInput): Promise<Character> => {
    const response = await api.post('/game/characters', characterData);
    return response.data;
  },
  
  generateCharacter: async (data: CharacterGenerateInput): Promise<Character> => {
    const response = await api.post('/game/characters/generate', data);
    return response.data;
  },
  
  getCharacters: async (): Promise<Character[]> => {
    const response = await api.get('/game/characters');
    return response.data;
  },
  
  getCharacterById: async (characterId: string): Promise<Character> => {
    const response = await api.get(`/game/characters/${characterId}`);
    return response.data;
  },
  
  getAvailableGenres: async (): Promise<GenreInfo[]> => {
    const response = await api.get('/game/genres');
    return response.data;
  },
  
  // Game session endpoints
  startNewGame: async (characterId: string): Promise<GameSession> => {
    const response = await api.post('/game/sessions', { characterId });
    return response.data;
  },
  
  getGameSessions: async (): Promise<GameSession[]> => {
    const response = await api.get('/game/sessions');
    return response.data;
  },
  
  getGameSession: async (sessionId: string): Promise<GameSession> => {
    const response = await api.get(`/game/sessions/${sessionId}`);
    return response.data;
  },
  
  saveGame: async (sessionId: string): Promise<GameSession> => {
    const response = await api.put(`/game/sessions/${sessionId}/save`);
    return response.data;
  },
  
  endGame: async (sessionId: string): Promise<GameSession> => {
    const response = await api.put(`/game/sessions/${sessionId}/end`);
    return response.data;
  },
  
  // Game progression
  makeChoice: async (sessionId: string, choiceId: string): Promise<GameSession> => {
    const response = await api.post(`/game/sessions/${sessionId}/choices/${choiceId}`);
    return response.data;
  },
  
  processUserInput: async (sessionId: string, inputData: UserInputData): Promise<GameSession> => {
    const response = await api.post(`/game/sessions/${sessionId}/input`, inputData);
    return response.data;
  }
};

// Export all API modules
export default {
  auth: authApi,
  game: gameApi,
  // Add other API modules as needed
};