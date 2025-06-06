import { useState, useCallback } from 'react';
import type { AppError } from '@/types';
import { ERROR_MESSAGES } from '@/constants';

interface UseErrorHandlerReturn {
  error: AppError | null;
  clearError: () => void;
  handleError: (error: unknown) => void;
  setError: (error: AppError) => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<AppError | null>(null);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const setError = useCallback((error: AppError) => {
    setErrorState(error);
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error('Error occurred:', error);

    if (error instanceof Error) {
      // Handle known Error types
      if (error.message.includes('User denied')) {
        setErrorState({
          code: 'USER_REJECTED',
          message: 'Transaction was rejected by user',
        });
      } else if (error.message.includes('insufficient funds')) {
        setErrorState({
          code: 'INSUFFICIENT_FUNDS',
          message: ERROR_MESSAGES.INSUFFICIENT_BALANCE,
        });
      } else if (error.message.includes('network')) {
        setErrorState({
          code: 'NETWORK_ERROR',
          message: ERROR_MESSAGES.NETWORK_ERROR,
        });
      } else {
        setErrorState({
          code: 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
        });
      }
    } else if (typeof error === 'string') {
      // Handle string errors
      setErrorState({
        code: 'STRING_ERROR',
        message: error,
      });
    } else if (error && typeof error === 'object') {
      // Handle object errors (from APIs, etc.)
      const errorObj = error as any;
      setErrorState({
        code: errorObj.code || 'API_ERROR',
        message: errorObj.message || ERROR_MESSAGES.NETWORK_ERROR,
        details: errorObj,
      });
    } else {
      // Handle unknown error types
      setErrorState({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: error,
      });
    }
  }, []);

  return {
    error,
    clearError,
    handleError,
    setError,
  };
}
