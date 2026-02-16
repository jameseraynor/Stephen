/**
 * Response Utilities
 *
 * Standard response formatting for API Gateway Lambda functions.
 */

import { APIGatewayProxyResult } from "aws-lambda";

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Standard response headers
 */
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // Configure properly in production
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  },
): APIGatewayProxyResult {
  const body: any = { data };

  if (pagination) {
    body.pagination = {
      ...pagination,
      hasNext: pagination.page < pagination.totalPages,
      hasPrevious: pagination.page > 1,
    };
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

/**
 * Error response
 */
export function errorResponse(
  error: unknown,
  requestId?: string,
): APIGatewayProxyResult {
  console.error("Error:", error);

  // Handle ApiError
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      headers,
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };
  }

  // Handle generic errors
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({
      error: {
        code: "INTERNAL_ERROR",
        message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    }),
  };
}

/**
 * Not found response
 */
export function notFoundResponse(resource: string): APIGatewayProxyResult {
  return errorResponse(new ApiError("NOT_FOUND", `${resource} not found`, 404));
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(
  message: string = "Unauthorized",
): APIGatewayProxyResult {
  return errorResponse(new ApiError("UNAUTHORIZED", message, 401));
}

/**
 * Forbidden response
 */
export function forbiddenResponse(
  message: string = "Forbidden",
): APIGatewayProxyResult {
  return errorResponse(new ApiError("FORBIDDEN", message, 403));
}
