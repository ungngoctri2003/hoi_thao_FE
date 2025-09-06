import { useCallback, useRef, useState } from 'react';

interface DebouncedApiOptions {
  debounceMs?: number;
}

export function useDebouncedApi(options: DebouncedApiOptions = {}) {
  const { debounceMs = 500 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeWithDebounce = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    return new Promise((resolve, reject) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const result = await apiCall();
          resolve(result);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(errorMessage);
          reject(err);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    });
  }, [debounceMs]);

  const executeImmediate = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    executeWithDebounce,
    executeImmediate,
    clearError
  };
}
