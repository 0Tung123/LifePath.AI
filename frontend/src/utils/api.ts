import axios from "axios";

// Keep track of the last time a 401 error was handled
let lastAuthRedirectTime = 0;
const AUTH_REDIRECT_THROTTLE = 5000; // 5 seconds

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create API instance without interceptors for server-side
export const createApiInstance = () => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Only add interceptors when in browser environment
if (typeof window !== "undefined") {
  // Add a request interceptor to add the auth token to every request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add a response interceptor to handle token expiration
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 responses (unauthorized)
      if (error.response && error.response.status === 401) {
        const currentTime = Date.now();

        // Prevent multiple redirects within a short time frame
        if (currentTime - lastAuthRedirectTime > AUTH_REDIRECT_THROTTLE) {
          console.log("Auth error detected, redirecting to login...");

          // Clear the token
          localStorage.removeItem("token");

          // Update the last redirect time
          lastAuthRedirectTime = currentTime;

          // Redirect to login page if not already there
          if (!window.location.pathname.includes("/auth/login")) {
            // Use a small timeout to prevent redirect cycles
            setTimeout(() => {
              window.location.href = "/auth/login";
            }, 100);
          }
        } else {
          console.log("Auth error redirect throttled");
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
