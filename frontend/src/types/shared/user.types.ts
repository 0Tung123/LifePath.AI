/**
 * User-related type definitions shared between frontend and backend
 */
import { BaseEntity } from './common.types';

/**
 * User roles
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * User authentication status
 */
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
}

/**
 * User entity interface
 */
export interface User extends BaseEntity {
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  profilePicture?: string;
  role?: UserRole;
}

/**
 * User registration data
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * User login credentials
 */
export interface LoginCredentialsDto {
  email: string;
  password: string;
}

/**
 * Authentication response with token
 */
export interface AuthResponseDto {
  user: User;
  access_token: string;
  token?: string; // For backward compatibility
}

/**
 * Password reset request
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Password reset with token
 */
export interface ResetPasswordDto {
  token: string;
  password: string;
}

/**
 * Email verification request
 */
export interface VerifyEmailDto {
  token: string;
}

/**
 * Resend verification email request
 */
export interface ResendVerificationDto {
  email: string;
}

/**
 * User profile update data
 */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
