import api from './api';
import {
  LoginCredentialsDto,
  RegisterUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendVerificationDto,
  UpdateProfileDto,
  AuthResponseDto,
  User,
  ApiResponse,
  AuthStatus,
} from '../types/shared';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterUserDto): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/register', data);
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentialsDto): Promise<AuthResponseDto> {
    const response = await api.post<ApiResponse<AuthResponseDto>>(
      '/auth/login',
      credentials,
    );

    // Store token and user data in localStorage
    if (typeof window !== 'undefined' && response.data.data) {
      const authData = response.data.data;
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }

    return response.data.data as AuthResponseDto;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data as User;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await api.patch<ApiResponse<User>>('/auth/profile', data);

    // Update stored user data
    if (typeof window !== 'undefined' && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }

    return response.data.data as User;
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/reset-password', data);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/verify-email', { token });
  }

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationDto): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/resend-verification', data);
  }

  /**
   * Handle Google login callback
   */
  processGoogleCallback(authResponse: AuthResponseDto): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
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

  /**
   * Get authentication status
   */
  getAuthStatus(): AuthStatus {
    if (typeof window === 'undefined') {
      return AuthStatus.LOADING;
    }

    return this.isAuthenticated()
      ? AuthStatus.AUTHENTICATED
      : AuthStatus.UNAUTHENTICATED;
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          return JSON.parse(userJson) as User;
        } catch (e) {
          console.error('Error parsing user data:', e);
          return null;
        }
      }
    }
    return null;
  }
}

// Type aliases for easier importing
export type LoginCredentials = LoginCredentialsDto;
export type RegisterData = RegisterUserDto;
export type UserProfile = User;

export const authService = new AuthService();
export default authService;
