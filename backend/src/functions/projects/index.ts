/**
 * Projects Lambda — Router
 *
 * Routes: /projects, /projects/{id}
 * Methods: GET, POST, PUT, DELETE
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent, requireRole } from "../../shared/auth";
import {
  validateBody,
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

// ============================================================================
// Schemas
// ============================================================================

const CreateProjectSchema = z
  .object({
    name: z.string().min(1).max(255),
    jobNumber: z.string().regex(/^\d{2}[A-Z]{3}\d{4}$/),
    contractAmount: z.number().positive(),
    budgetedGpPct: z.number().min(0).max(100),
    burdenPct: z.number().min(0).optional(),
    startDate: z.string(),
    endDate: z.string(),
    status: z
      .enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"])
      .default("ACTIVE"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

const UpdateProjectSchema = CreateProjectSchema.partial();

const ListQuerySchema = commonSchemas.pagination.extend({
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
  search: z.string().optional(),
});

// ============================================================================
// SQL Fragments
// ============================================================================

const PROJECT_COLUMNS = `
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
`;

// ============================================================================
// Router
// ============================================================================

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logger.appendKeys({ requestId });
    const method = event.httpMethod;
    const id = event.pathParameters?.id;

    switch (method) {
      case "GET":
        return id ? getProject(event, id) : listProjects(event);
      case "POST":
        return createProject(event);
      case "PUT":
        if (!id)
          throw new ApiError("VALIDATION_ERROR", "Project ID required", 400);
        return updateProject(event, id);
      case "DELETE":
        if (!id)
          throw new ApiError("VALIDATION_ERROR", "Project ID required", 400);
        return deleteProject(event, id);
      default:
        throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
    }
  } catch (error) {
    logger.error("Error processing request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}

// ============================================================================
// Handlers
// ============================================================================

async function listProjects(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const params = validateQuery(
    ListQuerySchema,
    event.queryStringParameters || {},
  );

  let sql = `SELECT ${PROJECT_COLUMNS} FROM PROJECTS WHERE 1=1`;
  const queryParams: any[] = [];
  let idx = 1;

  if (params.status) {
    sql += ` AND status = $${idx++}`;
    queryParams.push(params.status);
  }
  if (params.search) {
    sql += ` AND (name ILIKE $${idx} OR job_number ILIKE $${idx})`;
    queryParams.push(`%${params.search}%`);
    idx++;
  }

  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*) as total FROM (${sql}) as filtered`,
    queryParams,
  );
  const totalItems = parseInt(countResult.rows[0].total, 10);

  sql += ` ORDER BY ${params.sort || "name"} ${params.order}`;
  sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
  queryParams.push(params.pageSize, (params.page - 1) * params.pageSize);

  const result = await query(sql, queryParams);

  return successResponse(result.rows, 200, {
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(totalItems / params.pageSize),
    totalItems,
  });
}

async function getProject(
  event: APIGatewayProxyEvent,
  id: string,
): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  validatePathParam("id", id, commonSchemas.uuid);

  const result = await query(
    `SELECT ${PROJECT_COLUMNS} FROM PROJECTS WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) return notFoundResponse("Project");
  return successResponse(result.rows[0]);
}

async function createProject(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");

  const body = validateBody(
    CreateProjectSchema,
    JSON.parse(event.body || "{}"),
  );

  const sql = `
    INSERT INTO PROJECTS (name, job_number, contract_amount, budgeted_gp_pct, burden_pct, start_date, end_date, status, created_by, updated_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING ${PROJECT_COLUMNS}
  `;

  const result = await query(sql, [
    body.name,
    body.jobNumber,
    body.contractAmount,
    body.budgetedGpPct,
    body.burdenPct || null,
    body.startDate,
    body.endDate,
    body.status,
    user.userId,
    user.userId,
  ]);

  logger.info("Project created", { id: result.rows[0].id });
  return successResponse(result.rows[0], 201);
}

async function updateProject(
  event: APIGatewayProxyEvent,
  id: string,
): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("id", id, commonSchemas.uuid);

  const body = validateBody(
    UpdateProjectSchema,
    JSON.parse(event.body || "{}"),
  );

  // Build dynamic SET clause
  const setClauses: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (body.name !== undefined) {
    setClauses.push(`name = $${idx++}`);
    params.push(body.name);
  }
  if (body.jobNumber !== undefined) {
    setClauses.push(`job_number = $${idx++}`);
    params.push(body.jobNumber);
  }
  if (body.contractAmount !== undefined) {
    setClauses.push(`contract_amount = $${idx++}`);
    params.push(body.contractAmount);
  }
  if (body.budgetedGpPct !== undefined) {
    setClauses.push(`budgeted_gp_pct = $${idx++}`);
    params.push(body.budgetedGpPct);
  }
  if (body.burdenPct !== undefined) {
    setClauses.push(`burden_pct = $${idx++}`);
    params.push(body.burdenPct);
  }
  if (body.startDate !== undefined) {
    setClauses.push(`start_date = $${idx++}`);
    params.push(body.startDate);
  }
  if (body.endDate !== undefined) {
    setClauses.push(`end_date = $${idx++}`);
    params.push(body.endDate);
  }
  if (body.status !== undefined) {
    setClauses.push(`status = $${idx++}`);
    params.push(body.status);
  }

  setClauses.push(`updated_by = $${idx++}`);
  params.push(user.userId);

  if (setClauses.length === 1) {
    throw new ApiError("VALIDATION_ERROR", "No fields to update", 400);
  }

  params.push(id);
  const sql = `UPDATE PROJECTS SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${PROJECT_COLUMNS}`;

  const result = await query(sql, params);
  if (result.rows.length === 0) return notFoundResponse("Project");

  logger.info("Project updated", { id });
  return successResponse(result.rows[0]);
}

async function deleteProject(
  event: APIGatewayProxyEvent,
  id: string,
): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  requireRole(user, "Admin");
  validatePathParam("id", id, commonSchemas.uuid);

  const result = await query(
    "DELETE FROM PROJECTS WHERE id = $1 RETURNING id",
    [id],
  );
  if (result.rows.length === 0) return notFoundResponse("Project");

  logger.info("Project deleted", { id });
  return successResponse({ message: "Project deleted" }, 204);
}
