import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/api";
import {
  setAuthToken,
  clearAuthToken,
  initializeAuthToken,
} from "@/utils/auth-token";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  setUserData: (userData: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log("🔑 [LOGIN-START] Attempting login", {
            email,
            timestamp: new Date().toISOString(),
          });

          const response = await api.post("/auth/login", { email, password });
          const { access_token } = response.data;
          console.log("✅ [LOGIN-SUCCESS] Login successful", {
            timestamp: new Date().toISOString(),
          });

          // Set token in localStorage and API headers
          setAuthToken(access_token);

          // Get user profile
          console.log("👤 [PROFILE-FETCH] Fetching user profile");
          const userResponse = await api.get("/user/profile");
          console.log(
            "✅ [PROFILE-SUCCESS] User profile fetched successfully",
            {
              userId: userResponse.data.id,
              email: userResponse.data.email,
              timestamp: new Date().toISOString(),
            }
          );

          set({
            token: access_token,
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("❌ [LOGIN-ERROR] Login failed:", {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            timestamp: new Date().toISOString(),
          });
          set({
            isLoading: false,
            error: error.response?.data?.message || "Login failed",
          });
          throw error;
        }
      },

      signup: async (
        email: string,
        password: string,
        firstName: string,
        lastName: string
      ) => {
        try {
          set({ isLoading: true, error: null });
          await api.post("/auth/register", {
            email,
            password,
            firstName,
            lastName,
          });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Signup failed",
          });
          throw error;
        }
      },

      logout: () => {
        // Get user info before logout for logging
        const { user } = useAuthStore.getState();
        const userId = user?.id;
        const userEmail = user?.email;

        // Clear token from localStorage and API headers
        clearAuthToken();

        console.log("🚪 [LOGOUT] User logged out", {
          userId,
          userEmail,
          timestamp: new Date().toISOString(),
        });

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      verifyEmail: async (token: string) => {
        try {
          set({ isLoading: true, error: null });
          await api.get(`/auth/verify-email?token=${token}`);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Email verification failed",
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          await api.post("/auth/forgot-password", { email });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Password reset request failed",
          });
          throw error;
        }
      },

      resetPassword: async (token: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          await api.post("/auth/reset-password", { token, password });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Password reset failed",
          });
          throw error;
        }
      },

      resendVerification: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          await api.post("/auth/resend-verification", { email });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Resend verification failed",
          });
          throw error;
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.patch("/user/profile", userData);
          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Profile update failed",
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUserData: (userData: User) => {
        console.log("👤 [USER-RESTORE] Restoring user session", {
          userId: userData.id,
          email: userData.email,
          timestamp: new Date().toISOString(),
        });

        set({
          user: userData,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
