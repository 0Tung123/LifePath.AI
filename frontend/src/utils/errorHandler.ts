import axios, { AxiosError } from "axios";

export interface ApiError {
  message: string;
  statusCode: number;
  path?: string;
  timestamp?: string;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Handle backend error responses
    if (axiosError.response) {
      const responseData = axiosError.response.data as ApiError;

      // If the backend returns a formatted error message
      if (responseData.message) {
        return responseData.message;
      }

      // Fallback to HTTP status text
      return `Error ${axiosError.response.status}: ${axiosError.response.statusText}`;
    }

    // Network errors
    if (axiosError.request && !axiosError.response) {
      return "Network error. Please check your internet connection and try again.";
    }

    // Other axios errors
    return axiosError.message;
  }

  // For non-axios errors
  if (error instanceof Error) {
    return error.message;
  }

  // For unknown errors
  return "An unknown error occurred. Please try again.";
}

export function logError(error: unknown, context?: string): void {
  if (context) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error("Error:", error);
  }

  // You could extend this to send errors to an error tracking service
}
