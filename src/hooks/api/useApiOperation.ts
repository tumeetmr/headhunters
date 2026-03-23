"use client";

import { useCallback, useState } from "react";
import { handleApiResponse, toApiError, type ApiError } from "@/lib/api/modules/common";

export interface UseApiOperationResult<TData, TArgs extends unknown[]> {
  data: TData | null;
  isLoading: boolean;
  error: ApiError | null;
  execute: (...args: TArgs) => Promise<TData>;
  reset: () => void;
}

export function useApiOperation<TData, TArgs extends unknown[]>(
  operation: (...args: TArgs) => Promise<TData>,
): UseApiOperationResult<TData, TArgs> {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await operation(...args);
        const normalized = handleApiResponse(response);
        setData(normalized);
        return normalized;
      } catch (unknownError) {
        const apiError = toApiError(unknownError);
        setError(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [operation],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}
