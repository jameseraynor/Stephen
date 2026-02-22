/**
 * Budget Lambda — Router
 *
 * Routes: /projects/{projectId}/budget, /projects/{projectId}/budget/{lineId}
 * Methods: GET, POST, PUT, DELETE
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

const CreateBudgetLineSchema = z.object({
  costCodeId: z.string().uuid(),
  description: z.string().max(500).optional(),
  budgetedAmount: z.number().min(0),
  budgetedQuantity: z.number().min(0).optional(),
  budgetedUnitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const UpdateBudgetLineSchema = CreateBudgetLineSchema.partial();

const BUDGET_COLUMNS = `
  bl.id, bl.project_id as "projectId", bl.cost_code_id as "costCodeId",
  bl.description, bl.budgeted_amount as "budgetedAmount",
  bl.budgeted_quantity as "budgetedQuantity", bl.budgeted_unit_cost as "budgetedUnitCost",
  bl.notes, bl.created_at as "createdAt", bl.updated_at as "updatedAt",
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
    const lineId = event.pathParameters?.lineId;

    switch (method) {
      case "GET":
        return listBudgetLines(event, projectId);
      case "POST":
        return createBudgetLine(event, projectId);
      case "PUT":
        if (!lineId)
          throw new ApiError("VALIDATION_ERROR", "lineId required", 400);
        return updateBudgetLine(event, projectId, lineId);
      case "DELETE":
        if (!lineId)
          throw new ApiError("VALIDATION_ERROR", "lineId required", 400);
        return deleteBudgetLine(event, projectId, lineId);
      default:
        throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
    }
  } catch (error) {
    logger.error("Error processing budget request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}

async function listBudgetLines(event: APIGatewayProxyEvent, projectId: string) {
  getUserFromEvent(event);
  const result = await query(
    `SELECT ${BUDGET_COLUMNS} FROM BUDGET_LINES bl JOIN COST_CODES cc ON cc.id = bl.cost_code_id WHERE bl.project_id = $1 ORDER BY cc.code`,
    [projectId],
  );
  return successResponse(result.rows);
}

async function createBudgetLine(
  event: APIGatewayProxyEvent,
  projectId: string,
) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  const body = validateBody(
    CreateBudgetLineSchema,
    JSON.parse(event.body || "{}"),
  );

  const result = await query(
    `INSERT INTO BUDGET_LINES (project_id, cost_code_id, description, budgeted_amount, budgeted_quantity, budgeted_unit_cost, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, project_id as "projectId", cost_code_id as "costCodeId", description, budgeted_amount as "budgetedAmount", created_at as "createdAt"`,
    [
      projectId,
      body.costCodeId,
      body.description,
      body.budgetedAmount,
      body.budgetedQuantity,
      body.budgetedUnitCost,
      body.notes,
    ],
  );

  return successResponse(result.rows[0], 201);
}

async function updateBudgetLine(
  event: APIGatewayProxyEvent,
  projectId: string,
  lineId: string,
) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("lineId", lineId, commonSchemas.uuid);
  const body = validateBody(
    UpdateBudgetLineSchema,
    JSON.parse(event.body || "{}"),
  );

  const setClauses: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (body.costCodeId !== undefined) {
    setClauses.push(`cost_code_id = $${idx++}`);
    params.push(body.costCodeId);
  }
  if (body.description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    params.push(body.description);
  }
  if (body.budgetedAmount !== undefined) {
    setClauses.push(`budgeted_amount = $${idx++}`);
    params.push(body.budgetedAmount);
  }
  if (body.budgetedQuantity !== undefined) {
    setClauses.push(`budgeted_quantity = $${idx++}`);
    params.push(body.budgetedQuantity);
  }
  if (body.budgetedUnitCost !== undefined) {
    setClauses.push(`budgeted_unit_cost = $${idx++}`);
    params.push(body.budgetedUnitCost);
  }
  if (body.notes !== undefined) {
    setClauses.push(`notes = $${idx++}`);
    params.push(body.notes);
  }

  if (setClauses.length === 0)
    throw new ApiError("VALIDATION_ERROR", "No fields to update", 400);

  params.push(lineId, projectId);
  const result = await query(
    `UPDATE BUDGET_LINES SET ${setClauses.join(", ")} WHERE id = $${idx++} AND project_id = $${idx} RETURNING id`,
    params,
  );

  if (result.rows.length === 0) return notFoundResponse("Budget line");
  return successResponse(result.rows[0]);
}

async function deleteBudgetLine(
  event: APIGatewayProxyEvent,
  projectId: string,
  lineId: string,
) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("lineId", lineId, commonSchemas.uuid);

  const result = await query(
    "DELETE FROM BUDGET_LINES WHERE id = $1 AND project_id = $2 RETURNING id",
    [lineId, projectId],
  );
  if (result.rows.length === 0) return notFoundResponse("Budget line");
  return successResponse({ message: "Budget line deleted" }, 204);
}
