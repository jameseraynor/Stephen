/**
 * useApi Hook
 *
 * Generic hook for API calls with loading, error, and data state management.
 * Provides a consistent pattern for all API interactions.
 */

import { useState, useCallback } from "react";
import { ApiClientError } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiClientError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  clearError: () => void;
}

/**
 * useApi Hook
 *
 * @param apiFunction - The API function to call
 * @returns State and control functions
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useApi(projectsApi.list);
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 * ```
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  /**
   * Execute the API call
   */
  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await apiFunction(...args);
        const data = response.data;

        setState({
          data,
          isLoading: false,
          error: null,
        });

        return data;
      } catch (error) {
        const apiError =
          error instanceof ApiClientError
            ? error
            : new ApiClientError(
                "UNKNOWN_ERROR",
                error instanceof Error ? error.message : "An error occurred",
              );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: apiError,
        }));

        throw apiError;
      }
    },
    [apiFunction],
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
}

/**
 * useApiMutation Hook
 *
 * Specialized hook for mutations (POST, PUT, DELETE) that don't need
 * to store the response data in state.
 *
 * @example
 * ```tsx
 * const { isLoading, error, mutate } = useApiMutation(projectsApi.create);
 *
 * const handleSubmit = async (data) => {
 *   await mutate(data);
 *   toast.success('Project created!');
 * };
 * ```
 */
export function useApiMutation<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<ApiResponse<T>>,
) {
  const [state, setState] = useState<{
    isLoading: boolean;
    error: ApiClientError | null;
  }>({
    isLoading: false,
    error: null,
  });

  /**
   * Execute the mutation
   */
  const mutate = useCallback(
    async (...args: Args): Promise<T> => {
      try {
        setState({ isLoading: true, error: null });

        const response = await apiFunction(...args);
        const data = response.data;

        setState({ isLoading: false, error: null });

        return data;
      } catch (error) {
        const apiError =
          error instanceof ApiClientError
            ? error
            : new ApiClientError(
                "UNKNOWN_ERROR",
                error instanceof Error ? error.message : "An error occurred",
              );

        setState({ isLoading: false, error: apiError });

        throw apiError;
      }
    },
    [apiFunction],
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    mutate,
    clearError,
  };
}
