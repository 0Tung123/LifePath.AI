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
    const response = await api.post<ApiResponse<void>>('/auth/register', data);
    // Log the response for debugging
    console.log('Register response:', response.data);
    return;
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
    if (typeof window !== 'undefined' && response.data) {
      // Check if response is wrapped in ApiResponse format
      const authData =
        response.data.success && response.data.data
          ? response.data.data
          : (response.data as unknown as AuthResponseDto);

      // Backend returns access_token, but we store it as token
      const token = authData.access_token || authData.token;

      console.log('Auth data received:', authData);
      console.log('Token to store:', token);

      if (token && authData.user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        console.log('Token stored successfully');

        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('Verified stored token:', storedToken);
      } else {
        console.error('Missing token or user in response:', {
          token,
          user: authData.user,
        });
      }
    }

    // Return the unwrapped data if it's in ApiResponse format
    return response.data.success && response.data.data
      ? response.data.data
      : (response.data as unknown as AuthResponseDto);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');

    // Log the response for debugging
    console.log('Profile response:', response.data);

    // Handle both wrapped and unwrapped responses
    return response.data.success && response.data.data
      ? response.data.data
      : (response.data as unknown as User);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await api.patch<ApiResponse<User>>('/auth/profile', data);

    // Log the response for debugging
    console.log('Update profile response:', response.data);

    // Handle both wrapped and unwrapped responses
    const userData =
      response.data.success && response.data.data
        ? response.data.data
        : (response.data as unknown as User);

    // Update stored user data
    if (typeof window !== 'undefined' && userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return userData;
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      '/auth/forgot-password',
      data,
    );
    console.log('Forgot password response:', response.data);
    return;
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      '/auth/reset-password',
      data,
    );
    console.log('Reset password response:', response.data);
    return;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>('/auth/verify-email', {
      token,
    });
    console.log('Verify email response:', response.data);
    return;
  }

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationDto): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      '/auth/resend-verification',
      data,
    );
    console.log('Resend verification response:', response.data);
    return;
  }

  /**
   * Handle Google login callback
   */
  processGoogleCallback(
    authResponse: AuthResponseDto | ApiResponse<AuthResponseDto>,
  ): void {
    if (typeof window !== 'undefined') {
      // Check if response is wrapped in ApiResponse format
      const authData =
        'success' in authResponse && authResponse.data
          ? (authResponse.data as AuthResponseDto)
          : (authResponse as AuthResponseDto);

      console.log('Google callback data:', authData);

      const token = authData.access_token || authData.token;
      if (token && authData.user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        console.log('Google auth token stored successfully');
        window.location.href = '/dashboard';
      } else {
        console.error('Missing token or user in Google response:', {
          token,
          user: authData.user,
        });
      }
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
