/**
 * Reference Data Lambda — Router
 *
 * Routes: /cost-codes, /cost-codes/{id}, /labor-rates
 * Methods: GET (read-only)
 *
 * Combined because both are read-only reference/lookup data.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent } from "../../shared/auth";
import {
  validatePathParam,
  validateQuery,
  commonSchemas,
} from "../../shared/validation";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  ApiError,
} from "../../shared/response";
import { logger } from "../../shared/logger";
import { query } from "../../shared/db";
import { z } from "zod";

const CostCodeQuerySchema = z.object({
  type: z
    .enum(["LABOR", "MATERIAL", "EQUIPMENT", "SUBCONTRACTOR", "OTHER"])
    .optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logger.appendKeys({ requestId });

    if (event.httpMethod !== "GET") {
      throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
    }

    // Route by path
    const path = event.resource || event.path;

    if (path.includes("labor-rates")) {
      return listLaborRates(event);
    }
    if (path.includes("cost-codes")) {
      const id = event.pathParameters?.id;
      return id ? getCostCode(event, id) : listCostCodes(event);
    }

    throw new ApiError("NOT_FOUND", "Route not found", 404);
  } catch (error) {
    logger.error("Error processing reference data request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}

async function listCostCodes(event: APIGatewayProxyEvent) {
  getUserFromEvent(event);
  const params = validateQuery(
    CostCodeQuerySchema,
    event.queryStringParameters || {},
  );

  let sql = `SELECT id, code, description, type, is_active as "isActive", created_at as "createdAt" FROM COST_CODES WHERE 1=1`;
  const qp: any[] = [];
  let idx = 1;

  if (params.type) {
    sql += ` AND type = $${idx++}`;
    qp.push(params.type);
  }
  if (params.isActive !== undefined) {
    sql += ` AND is_active = $${idx++}`;
    qp.push(params.isActive);
  }
  if (params.search) {
    sql += ` AND (code ILIKE $${idx} OR description ILIKE $${idx})`;
    qp.push(`%${params.search}%`);
    idx++;
  }

  sql += " ORDER BY code";
  const result = await query(sql, qp);
  return successResponse(result.rows);
}

async function getCostCode(event: APIGatewayProxyEvent, id: string) {
  getUserFromEvent(event);
  validatePathParam("id", id, commonSchemas.uuid);

  const result = await query(
    `SELECT id, code, description, type, is_active as "isActive", created_at as "createdAt" FROM COST_CODES WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) return notFoundResponse("Cost code");
  return successResponse(result.rows[0]);
}

async function listLaborRates(event: APIGatewayProxyEvent) {
  getUserFromEvent(event);

  const result = await query(
    `SELECT id, code, description, hourly_rate as "hourlyRate", is_active as "isActive", created_at as "createdAt"
     FROM LABOR_RATES WHERE is_active = true ORDER BY code`,
  );

  return successResponse(result.rows);
}
