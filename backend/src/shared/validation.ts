/**
 * Validation Utilities
 *
 * Request validation using Zod schemas.
 */

import { z } from "zod";
import { ApiError } from "./response";

/**
 * Validate request body
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string> = {};

      error.errors.forEach((err) => {
        const path = err.path.join(".");
        details[path] = err.message;
      });

      throw new ApiError(
        "VALIDATION_ERROR",
        "Invalid request data",
        400,
        details,
      );
    }
    throw error;
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, params: unknown): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string> = {};

      error.errors.forEach((err) => {
        const path = err.path.join(".");
        details[path] = err.message;
      });

      throw new ApiError(
        "VALIDATION_ERROR",
        "Invalid query parameters",
        400,
        details,
      );
    }
    throw error;
  }
}

/**
 * Validate path parameters
 */
export function validatePathParam(
  name: string,
  value: string | undefined,
  schema: z.ZodSchema,
): any {
  if (!value) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Missing path parameter: ${name}`,
      400,
    );
  }

  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(
        "VALIDATION_ERROR",
        `Invalid path parameter: ${name}`,
        400,
        { [name]: error.errors[0].message },
      );
    }
    throw error;
  }
}

/**
 * Parse JSON body from API Gateway event
 */
export function parseBody(raw: string | null): unknown {
  return JSON.parse(raw || "{}");
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid("Invalid UUID format"),

  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("asc"),
  }),

  dateRange: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
      message: "End date must be after start date",
    }),
};
