/**
 * Actuals Lambda — Router
 *
 * Routes: /projects/{projectId}/actuals, /projects/{projectId}/actuals/{month}
 * Methods: GET, POST
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent, requireRole } from "../../shared/auth";
import {
  validateBody,
  validatePathParam,
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

const CreateActualSchema = z.object({
  costCodeId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  actualAmount: z.number().min(0),
  actualQuantity: z.number().min(0).optional(),
  actualUnitCost: z.number().min(0).optional(),
  source: z.enum(["MANUAL", "SPECTRUM"]).default("MANUAL"),
  notes: z.string().optional(),
});

const ACTUAL_COLUMNS = `
  a.id, a.project_id as "projectId", a.cost_code_id as "costCodeId",
  a.month, a.actual_amount as "actualAmount",
  a.actual_quantity as "actualQuantity", a.actual_unit_cost as "actualUnitCost",
  a.source, a.notes, a.created_at as "createdAt",
  cc.code as "costCodeCode", cc.description as "costCodeDescription", cc.type as "costCodeType"
`;

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logger.appendKeys({ requestId });
    const method = event.httpMethod;
    const projectId = validatePathParam(
      "projectId",
      event.pathParameters?.projectId,
      commonSchemas.uuid,
    );
    const month = event.pathParameters?.month;

    switch (method) {
      case "GET":
        return month
          ? getMonthActuals(event, projectId, month)
          : listActuals(event, projectId);
      case "POST":
        return upsertActual(event, projectId);
      default:
        throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
    }
  } catch (error) {
    logger.error("Error processing actuals request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}

async function listActuals(event: APIGatewayProxyEvent, projectId: string) {
  getUserFromEvent(event);
  const month = event.queryStringParameters?.month;

  let sql = `SELECT ${ACTUAL_COLUMNS} FROM ACTUALS a JOIN COST_CODES cc ON cc.id = a.cost_code_id WHERE a.project_id = $1`;
  const params: any[] = [projectId];

  if (month) {
    sql += " AND a.month = $2";
    params.push(month);
  }

  sql += " ORDER BY a.month DESC, cc.code";
  const result = await query(sql, params);
  return successResponse(result.rows);
}

async function getMonthActuals(
  event: APIGatewayProxyEvent,
  projectId: string,
  month: string,
) {
  getUserFromEvent(event);
  const result = await query(
    `SELECT ${ACTUAL_COLUMNS} FROM ACTUALS a JOIN COST_CODES cc ON cc.id = a.cost_code_id WHERE a.project_id = $1 AND a.month = $2 ORDER BY cc.code`,
    [projectId, month],
  );
  return successResponse(result.rows);
}

async function upsertActual(event: APIGatewayProxyEvent, projectId: string) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  const body = validateBody(CreateActualSchema, JSON.parse(event.body || "{}"));

  // Upsert: insert or update if same project + cost_code + month
  const result = await query(
    `INSERT INTO ACTUALS (project_id, cost_code_id, month, actual_amount, actual_quantity, actual_unit_cost, source, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (project_id, cost_code_id, month)
     DO UPDATE SET actual_amount = $4, actual_quantity = $5, actual_unit_cost = $6, source = $7, notes = $8
     RETURNING id, month, actual_amount as "actualAmount", created_at as "createdAt"`,
    [
      projectId,
      body.costCodeId,
      body.month,
      body.actualAmount,
      body.actualQuantity,
      body.actualUnitCost,
      body.source,
      body.notes,
    ],
  );

  return successResponse(result.rows[0], 201);
}
