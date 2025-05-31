import apiService from "./api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  User,
} from "@/types/auth.types";

/**
 * Authentication service for handling auth-related API calls
 */
class AuthService {
  /**
   * Get the current authentication status
   */
  async getAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    return apiService.get("/auth/status");
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiService.post("/auth/login", credentials);
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterCredentials): Promise<AuthResponse> {
    return apiService.post("/auth/register", userData);
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<{ success: boolean }> {
    return apiService.post("/auth/logout");
  }

  /**
   * Request a password reset
   */
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ success: boolean }> {
    return apiService.post("/auth/forgot-password", data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ success: boolean }> {
    return apiService.post("/auth/reset-password", data);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<{ success: boolean }> {
    return apiService.post("/auth/verify-email", data);
  }

  /**
   * Resend verification email
   */
  async resendVerification(
    data: ResendVerificationRequest
  ): Promise<{ success: boolean }> {
    return apiService.post("/auth/resend-verification", data);
  }

  /**
   * Initiate Google OAuth login
   */
  getGoogleAuthUrl(): string {
    return "/api/auth/google";
  }
}

// Create a singleton instance
const authService = new AuthService();

export default authService;
