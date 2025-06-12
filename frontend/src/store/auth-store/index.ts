import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/api";

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
          const response = await api.post("/auth/login", { email, password });
          const { access_token } = response.data;

          // Set token in axios defaults
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;

          // Get user profile
          const userResponse = await api.get("/user/profile");

          set({
            token: access_token,
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
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
        // Remove token from axios defaults
        delete api.defaults.headers.common["Authorization"];

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      verifyEmail: async (token: string) => {
        try {
          set({ isLoading: true, error: null });
          await api.post("/auth/verify-email", { token });
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
