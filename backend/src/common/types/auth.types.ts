// Core authentication types
export interface GoogleUserProfile {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly picture: string;
  readonly accessToken: string;
}

export interface AuthResponse {
  readonly message: string;
  readonly statusCode?: number;
  readonly user?: {
    readonly id: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
  };
}

export interface LoginResponse {
  readonly access_token: string;
  readonly token?: string;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
  };
}

export interface ValidatedUser {
  readonly id: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly isActive: boolean;
  readonly emailVerificationToken?: string | null;
  readonly emailVerificationExpires?: Date | null;
  readonly profilePicture?: string | null;
  readonly googleId?: string | null;
  readonly password?: string;
  readonly resetPasswordToken?: string | null;
  readonly resetPasswordExpires?: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly isActive: boolean;
  readonly profilePicture?: string | null;
  readonly googleId?: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface JwtPayload {
  readonly email: string;
  readonly sub: string;
  readonly iat?: number;
  readonly exp?: number;
}

export interface PasswordResetRequest {
  readonly email: string;
  readonly token: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
}

export interface EmailVerificationRequest {
  readonly email: string;
  readonly token: string;
  readonly expiresAt: Date;
}

export interface GoogleAuthUser {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly picture: string;
  readonly accessToken: string;
}
