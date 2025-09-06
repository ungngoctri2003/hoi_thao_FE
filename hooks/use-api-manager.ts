import { useCallback, useRef, useState, useMemo } from 'react';

interface ApiManagerOptions {
  debounceMs?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useApiManager(options: ApiManagerOptions = {}) {
  const {
    debounceMs = 300,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeWithDebounce = useCallback(async <T>(
    apiCall: () => Promise<T>,
    immediate = false
  ): Promise<T | null> => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Create new abort controller
          abortControllerRef.current = new AbortController();

          const result = await apiCall();
          resolve(result);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          
          // Handle rate limiting specifically
          if (errorMessage.includes('429')) {
            setError('Quá nhiều yêu cầu. Vui lòng thử lại sau vài giây.');
            
            // Retry with exponential backoff
            let attempts = 0;
            const retry = async () => {
              if (attempts >= retryAttempts) {
                reject(new Error('Max retry attempts reached'));
                return;
              }
              
              attempts++;
              const delay = retryDelay * Math.pow(2, attempts - 1);
              
              setTimeout(async () => {
                try {
                  const result = await apiCall();
                  resolve(result);
                } catch (retryErr) {
                  if (attempts < retryAttempts) {
                    retry();
                  } else {
                    reject(retryErr);
                  }
                }
              }, delay);
            };
            
            retry();
          } else {
            setError(errorMessage);
            reject(err);
          }
        } finally {
          setIsLoading(false);
        }
      };

      if (immediate) {
        execute();
      } else {
        timeoutRef.current = setTimeout(execute, debounceMs);
      }
    });
  }, [debounceMs, retryAttempts, retryDelay]);

  const executeImmediate = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    return executeWithDebounce(apiCall, true);
  }, [executeWithDebounce]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    isLoading,
    error,
    executeWithDebounce,
    executeImmediate,
    clearError,
    cancel
  };
}
