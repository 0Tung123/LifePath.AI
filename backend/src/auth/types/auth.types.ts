import { User } from 'src/user/entities/user.entity';

export interface RegisterResponse {
  message: string;
  statusCode?: number;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface LoginResponse {
  access_token: string;
  user: User; // Will be properly typed later
}

export interface PasswordResetResponse {
  message: string;
  statusCode?: number;
}

export interface EmailVerificationResponse {
  message: string;
  statusCode?: number;
}

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  googleId: string | null;
}
