/**
 * Lambda Handler Template
 *
 * Standard template for Lambda function handlers.
 * Copy this file and modify for each endpoint.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent, requireRole } from "./auth";
import { validateBody, validatePathParam, commonSchemas } from "./validation";
import { successResponse, errorResponse } from "./response";
import { logger } from "./logger";
import { query } from "./db";
import { z } from "zod";

/**
 * Request validation schema
 * Define your schema here
 */
const RequestSchema = z.object({
  // Add your fields here
  name: z.string().min(1).max(255),
  // ...
});

type RequestBody = z.infer<typeof RequestSchema>;

/**
 * Lambda Handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    // Set logging context
    logger.appendKeys({ requestId });
    logger.info("Processing request", {
      path: event.path,
      method: event.httpMethod,
    });

    // Get authenticated user
    const user = getUserFromEvent(event);
    logger.appendKeys({ userId: user.userId });

    // Check authorization (if needed)
    requireRole(user, "ProjectManager"); // Adjust role as needed

    // Validate path parameters (if needed)
    // const id = validatePathParam('id', event.pathParameters?.id, commonSchemas.uuid);

    // Validate request body (for POST/PUT)
    // const body = validateBody(RequestSchema, JSON.parse(event.body || '{}'));

    // Validate query parameters (for GET)
    // const params = validateQuery(commonSchemas.pagination, event.queryStringParameters);

    // Business logic here
    // const result = await query('SELECT * FROM table WHERE id = $1', [id]);

    // Return success response
    return successResponse({
      message: "Success",
      // data: result.rows,
    });
  } catch (error) {
    logger.error("Error processing request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}
