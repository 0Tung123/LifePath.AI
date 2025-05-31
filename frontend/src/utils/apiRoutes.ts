import axios, { AxiosRequestConfig } from "axios";

// Get the base URL from environment variables or use default
const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create a configured axios instance for API routes
export const apiRouteClient = (cookie?: string) => {
  const config: AxiosRequestConfig = {
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add cookie header if provided
  if (cookie) {
    config.headers = {
      ...config.headers,
      Cookie: cookie,
    };
  }

  return axios.create(config);
};
