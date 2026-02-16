/**
 * API Client
 *
 * Base API client with interceptors for authentication, error handling,
 * and request/response transformation.
 */

import { get, post, put, del } from "aws-amplify/api";
import type { ApiResponse, ApiError, PaginationParams } from "@/types";

const API_NAME = "cost-control-api";

/**
 * API Client Error
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, string>,
    public statusCode?: number,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  static fromApiError(error: ApiError, statusCode?: number): ApiClientError {
    return new ApiClientError(
      error.code,
      error.message,
      error.details,
      statusCode,
      error.requestId,
    );
  }
}

/**
 * Handle API errors
 */
function handleApiError(error: unknown): never {
  console.error("API Error:", error);

  // Handle Amplify API errors
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as {
      response: { statusCode: number; body: { error: ApiError } };
    };

    if (apiError.response?.body?.error) {
      throw ApiClientError.fromApiError(
        apiError.response.body.error,
        apiError.response.statusCode,
      );
    }
  }

  // Handle network errors
  if (error instanceof Error) {
    if (error.message.includes("Network")) {
      throw new ApiClientError(
        "NETWORK_ERROR",
        "Network error. Please check your connection.",
      );
    }

    throw new ApiClientError(
      "UNKNOWN_ERROR",
      error.message || "An unexpected error occurred",
    );
  }

  // Fallback error
  throw new ApiClientError("UNKNOWN_ERROR", "An unexpected error occurred");
}

/**
 * Build query string from pagination params
 */
function buildQueryString(
  params?: PaginationParams & Record<string, unknown>,
): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * API Client
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(
    path: string,
    params?: PaginationParams & Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    try {
      const queryString = buildQueryString(params);
      const operation = get({
        apiName: API_NAME,
        path: `${path}${queryString}`,
      });

      const { body } = await operation.response;
      const json = await body.json();

      return json as unknown as ApiResponse<T>;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * POST request
   */
  async post<T, D = unknown>(path: string, data: D): Promise<ApiResponse<T>> {
    try {
      const operation = post({
        apiName: API_NAME,
        path,
        options: {
          body: data as any,
        },
      });

      const { body } = await operation.response;
      const json = await body.json();

      return json as unknown as ApiResponse<T>;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * PUT request
   */
  async put<T, D = unknown>(path: string, data: D): Promise<ApiResponse<T>> {
    try {
      const operation = put({
        apiName: API_NAME,
        path,
        options: {
          body: data as any,
        },
      });

      const { body } = await operation.response;
      const json = await body.json();

      return json as unknown as ApiResponse<T>;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const operation = del({
        apiName: API_NAME,
        path,
      });

      const { body } = await operation.response;
      const json = await body.json();

      return json as unknown as ApiResponse<T>;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
