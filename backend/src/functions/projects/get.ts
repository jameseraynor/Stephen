/**
 * Get Project Handler
 *
 * GET /projects/{id}
 * Retrieves a single project by ID.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent } from "../../shared/auth";
import { validatePathParam, commonSchemas } from "../../shared/validation";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../shared/response";
import { logger } from "../../shared/logger";
import { query } from "../../shared/db";

/**
 * Lambda Handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    // Set logging context
    logger.setContext({ requestId });
    logger.info("Getting project", {
      path: event.path,
      method: event.httpMethod,
    });

    // Get authenticated user
    const user = getUserFromEvent(event);
    logger.setContext({ userId: user.userId });

    // Validate path parameter
    const id = validatePathParam(
      "id",
      event.pathParameters?.id,
      commonSchemas.uuid,
    );

    logger.debug("Project ID", { id });

    // Query database
    const sql = `
      SELECT 
        id,
        name,
        job_number as "jobNumber",
        contract_amount as "contractAmount",
        budgeted_gp_pct as "budgetedGpPct",
        burden_pct as "burdenPct",
        start_date as "startDate",
        end_date as "endDate",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM PROJECTS
      WHERE id = $1
    `;

    const result = await query(sql, [id]);

    // Check if project exists
    if (result.rows.length === 0) {
      logger.warn("Project not found", { id });
      return notFoundResponse("Project");
    }

    logger.info("Project retrieved", { id });

    // Return success response
    return successResponse(result.rows[0]);
  } catch (error) {
    logger.error("Error getting project", error);
    return errorResponse(error, requestId);
  } finally {
    logger.clearContext();
  }
}
