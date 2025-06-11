import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../utils/errorHandler';

interface UseFetchOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
  dependencies?: any[];
}

interface UseFetchResult<T, P = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  fetch: (params?: P) => Promise<T | null>;
  reset: () => void;
}

export function useFetch<T, P = any>(
  fetchFn: (params?: P) => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T, P> {
  const { initialData = null, autoFetch = true, dependencies = [] } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);
  
  const fetch = useCallback(async (params?: P): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchFn(params);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);
  
  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);
  
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [...dependencies, fetch, autoFetch]);
  
  return { data, isLoading, error, fetch, reset };
}