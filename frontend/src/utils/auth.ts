// Auth utility functions
// Note: JWT tokens are stored as httpOnly cookies, so we can't access them directly
// We'll rely on the server to validate the cookie and return auth status

import { User } from "@/types/auth.types";

export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  user?: User;
}> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/auth/status`, {
      method: "GET",
      credentials: "include", // Include cookies in the request
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { isAuthenticated: false };
  }
};

export const logout = async (): Promise<void> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
