import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, LoginCredentials, RegisterCredentials, ResetPasswordData } from '../api/apiClient';
import { getErrorMessage } from '../utils/errorHandler';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<string>;
  resendVerification: (email: string) => Promise<string>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: ResetPasswordData) => Promise<string>;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }

    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    if (window.location.pathname === '/auth/google-callback' && oauthToken) {
      authApi.handleGoogleCallback(oauthToken);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Session expired. Please login again.');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.access_token);
      await fetchCurrentUser(); // Fetch user data after login
      setError(null);
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(credentials);
      setError(null);
      return response.message;
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.verifyEmail(token);
      setError(null);
      return response.message;
    } catch (error) {
      console.error('Email verification failed:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.resendVerification(email);
      setError(null);
      return response.message;
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.forgotPassword(email);
      setError(null);
      return response.message;
    } catch (error) {
      console.error('Failed to process forgot password request:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      const response = await authApi.resetPassword(data);
      setError(null);
      return response.message;
    } catch (error) {
      console.error('Failed to reset password:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setError(null);
    window.location.href = '/auth/login';
  };

  const googleLogin = () => {
    authApi.googleLogin();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && user.isActive,
        error,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        googleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};