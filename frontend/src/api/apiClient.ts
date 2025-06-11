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

export interface GameState {
  // Define game state properties
  id: string;
  // other properties
}

export const gameApi = {
  getGameState: async (gameId: string): Promise<GameState> => {
    const response = await api.get(`/game/${gameId}`);
    return response.data;
  },
  
  // Add other game-related API calls
};

// Export all API modules
export default {
  auth: authApi,
  game: gameApi,
  // Add other API modules as needed
};