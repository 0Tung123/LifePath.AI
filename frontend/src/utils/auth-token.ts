/**
 * Utility functions for handling authentication tokens
 */

import api from './api';

// Token storage key
const TOKEN_KEY = 'auth_token';

/**
 * Set the authentication token in localStorage and API headers
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    
    // Set in API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔑 [TOKEN-SET] Token set in API headers', {
      tokenFirstChars: token.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });
  } else {
    // Remove from localStorage
    localStorage.removeItem(TOKEN_KEY);
    
    // Remove from API headers
    delete api.defaults.headers.common['Authorization'];
    console.log('🔑 [TOKEN-REMOVED] Token removed from API headers', {
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if the token exists and set it in API headers
 * Returns true if token was found and set
 */
export const initializeAuthToken = (): boolean => {
  const token = getAuthToken();
  
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔄 [TOKEN-INIT] Token initialized from localStorage', {
      tokenFirstChars: token.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });
    return true;
  }
  
  console.log('🔄 [TOKEN-INIT] No token found in localStorage', {
    timestamp: new Date().toISOString()
  });
  return false;
};

/**
 * Clear the authentication token
 */
export const clearAuthToken = (): void => {
  setAuthToken(null);
};