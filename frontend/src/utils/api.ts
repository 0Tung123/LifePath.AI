import axios from "axios";
import { store } from "@/store";
import { logout, refreshAccessToken } from "@/store/slices/authSlice";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const result = await store.dispatch(refreshAccessToken()).unwrap();
        
        if (result.access_token) {
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${result.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
