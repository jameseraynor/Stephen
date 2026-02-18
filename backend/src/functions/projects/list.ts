/**
 * List Projects Handler
 *
 * GET /projects
 * Lists all projects with optional filtering and pagination.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent } from "../../shared/auth";
import { validateQuery, commonSchemas } from "../../shared/validation";
import { successResponse, errorResponse } from "../../shared/response";
import { logger } from "../../shared/logger";
import { query } from "../../shared/db";
import { z } from "zod";

/**
 * Query parameters schema
 */
const QuerySchema = commonSchemas.pagination.extend({
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
  search: z.string().optional(),
});

type QueryParams = z.infer<typeof QuerySchema>;

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
    logger.info("Listing projects", {
      path: event.path,
      method: event.httpMethod,
    });

    // Get authenticated user
    const user = getUserFromEvent(event);
    logger.appendKeys({ userId: user.userId });

    // Validate query parameters
    const params = validateQuery(
      QuerySchema,
      event.queryStringParameters || {},
    );

    logger.debug("Query parameters", params);

    // Build SQL query
    let sql = `
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
      WHERE 1=1
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filter by status
    if (params.status) {
      sql += ` AND status = $${paramIndex}`;
      queryParams.push(params.status);
      paramIndex++;
    }

    // Search by name or job number
    if (params.search) {
      sql += ` AND (name ILIKE $${paramIndex} OR job_number ILIKE $${paramIndex})`;
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    // Count total items
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as filtered`;
    const countResult = await query<{ total: string }>(countSql, queryParams);
    const totalItems = parseInt(countResult.rows[0].total, 10);

    // Add sorting
    const sortColumn = params.sort || "name";
    const sortOrder = params.order || "asc";
    sql += ` ORDER BY "${sortColumn}" ${sortOrder}`;

    // Add pagination
    const offset = (params.page - 1) * params.pageSize;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(params.pageSize, offset);

    // Execute query
    logger.debug("Executing query", { sql, params: queryParams });
    const result = await query(sql, queryParams);

    logger.info("Projects retrieved", { count: result.rows.length });

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / params.pageSize);

    // Return success response
    return successResponse(result.rows, 200, {
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      totalItems,
    });
  } catch (error) {
    logger.error("Error listing projects", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}
