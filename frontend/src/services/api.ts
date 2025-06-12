import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Base API URL with fixed port 3000 for backend
const API_URL = "http://localhost:3000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (
    config: import("axios").InternalAxiosRequestConfig
  ): import("axios").InternalAxiosRequestConfig => {
    // Get token from localStorage (only on client side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Only on client side
      if (typeof window !== "undefined") {
        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login page if not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
