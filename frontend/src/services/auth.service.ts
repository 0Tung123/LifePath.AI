import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<void> {
    await api.post('/auth/register', data);
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  }
  
  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/auth/profile', data);
    return response.data;
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await api.post('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await api.get(`/auth/verify-email?token=${token}`);
  }

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationData): Promise<void> {
    await api.post('/auth/resend-verification', data);
  }

  /**
   * Handle Google login callback
   */
  processGoogleCallback(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      window.location.href = '/dashboard';
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
}

export const authService = new AuthService();
export default authService;