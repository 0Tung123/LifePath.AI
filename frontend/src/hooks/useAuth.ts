import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { checkAuthStatus } from "@/store/slices/authSlice";

interface UseAuthOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  redirectAuthenticatedTo?: string;
}

/**
 * Custom hook for handling authentication state and redirects
 */
export default function useAuth({
  requireAuth = false,
  redirectTo = "/login",
  redirectIfAuthenticated = false,
  redirectAuthenticatedTo = "/game",
}: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Check authentication status
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    // Skip redirects while loading
    if (isLoading) return;

    // Redirect if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const currentPath = encodeURIComponent(pathname);
      router.push(`${redirectTo}?redirect=${currentPath}`);
      return;
    }

    // Redirect if user is authenticated but should not be on this page
    if (redirectIfAuthenticated && isAuthenticated) {
      router.push(redirectAuthenticatedTo);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectIfAuthenticated,
    redirectTo,
    redirectAuthenticatedTo,
    router,
    pathname,
  ]);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
  };
}
