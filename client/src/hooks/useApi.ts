import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      console.log('useApi: Executing function with args:', args);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiFunction(...args);
        console.log('useApi: Function executed successfully:', result);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        console.error('useApi: Function failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
} 