'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import authService, {
  LoginCredentials,
  RegisterData,
  UserProfile,
} from '../services/auth.service';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    // Use a flag to prevent hydration mismatch
    const isBrowser = typeof window !== 'undefined';

    const checkAuth = async () => {
      try {
        // Only check authentication on the client side
        if (isBrowser && authService.isAuthenticated()) {
          // Get user from localStorage first to prevent flicker
          const cachedUser = authService.getCurrentUser();
          if (cachedUser) {
            setUser(cachedUser);
          }

          // Then fetch the latest profile from the server
          try {
            const userProfile = await authService.getProfile();
            setUser(userProfile);
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError);
            // If we can't get the profile but have a cached user, keep using that
            if (!cachedUser) {
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isBrowser) {
          authService.logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on the client side
    if (isBrowser) {
      checkAuth();
    } else {
      // On server side, just set loading to false
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const authResponse = await authService.login(credentials);

      // authService.login already saves to localStorage, so we just need to set user
      if (authResponse && authResponse.user) {
        setUser(authResponse.user);
      } else {
        throw new Error('Invalid login response');
      }
    } catch {
      const errorMessage = 'Failed to login. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(data);
    } catch {
      const errorMessage = 'Failed to register. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!authService.isAuthenticated()) {
      return;
    }

    try {
      const userProfile = await authService.getProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
