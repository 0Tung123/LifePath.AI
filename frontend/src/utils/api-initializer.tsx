"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { initializeAuthToken } from "@/utils/auth-token";

export function ApiInitializer() {
  const { token, isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth on component mount
  useEffect(() => {
    console.log("ApiInitializer: Initializing auth state");

    // Try to initialize token from localStorage
    const hasToken = initializeAuthToken();

    console.log(
      "ApiInitializer: Token initialized from localStorage =",
      hasToken
    );
    console.log(
      "ApiInitializer: isAuthenticated =",
      isAuthenticated,
      "token =",
      token ? "exists" : "null"
    );

    // If we have a token in localStorage but not in auth store, we need to fetch the user profile
    if (hasToken && !isAuthenticated && !user) {
      console.log(
        "ApiInitializer: Token exists but user not authenticated, attempting to restore session"
      );

      // Attempt to fetch user profile to restore session
      api
        .get("/user/profile")
        .then((response) => {
          console.log("ApiInitializer: Session restored successfully");

          // Update auth store with user data
          const { setUserData } = useAuthStore.getState();
          if (setUserData) {
            setUserData(response.data);
          }
        })
        .catch((error) => {
          console.error(
            "ApiInitializer: Failed to restore session",
            error.response?.status
          );
          // Clear invalid token
          const { logout } = useAuthStore.getState();
          logout();
        });
    }

    // Redirect logic for protected routes
    if (!isAuthenticated && !hasToken) {
      const isProtectedRoute =
        pathname?.startsWith("/game") || pathname?.startsWith("/dashboard");

      if (isProtectedRoute) {
        console.log(
          "🔒 [AUTH-REDIRECT] No auth on protected route, redirecting to login",
          {
            pathname,
            isAuthenticated,
            hasToken,
            timestamp: new Date().toISOString(),
          }
        );
        router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      }
    }
  }, []);

  // Set up API interceptors
  useEffect(() => {
    // Set up an interceptor to handle 401 errors globally
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          "API Error:",
          error.response?.status,
          error.response?.data
        );

        if (error.response?.status === 401 && isAuthenticated) {
          // If we get a 401 and we're supposed to be authenticated, log out
          console.log("❌ [AUTH-ERROR-401] Unauthorized error, logging out", {
            url: error.config?.url,
            method: error.config?.method,
            pathname,
            timestamp: new Date().toISOString(),
          });
          logout();

          // Determine redirect path
          const redirectParam = pathname
            ? `?redirect=${encodeURIComponent(pathname)}`
            : "";
          router.push(`/login?expired=true${redirectParam}`);
        }
        return Promise.reject(error);
      }
    );

    // Clean up the interceptor when the component unmounts
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated, logout, router, pathname]);

  return null; // This component doesn't render anything
}
