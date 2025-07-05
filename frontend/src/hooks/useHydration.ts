import { useEffect, useState } from 'react';

/**
 * Hook to prevent hydration mismatch errors caused by browser extensions
 * or other client-side only modifications
 */
export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
