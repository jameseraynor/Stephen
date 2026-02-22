/**
 * Employees Lambda — Router
 *
 * Routes: /projects/{projectId}/employees, /projects/{projectId}/employees/{id}
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

const CreateEmployeeSchema = z.object({
  name: z.string().min(1).max(255),
  laborRateId: z.string().uuid(),
  homeBranch: z.string().max(100).optional(),
  projectRole: z.string().max(100).optional(),
  assignedDate: z.string(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

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
    const employeeId = event.pathParameters?.id;

    switch (method) {
      case "GET":
        return listEmployees(event, projectId);
      case "POST":
        return createEmployee(event, projectId);
      case "PUT":
        if (!employeeId)
          throw new ApiError("VALIDATION_ERROR", "Employee ID required", 400);
        return updateEmployee(event, projectId, employeeId);
      case "DELETE":
        if (!employeeId)
          throw new ApiError("VALIDATION_ERROR", "Employee ID required", 400);
        return deleteEmployee(event, projectId, employeeId);
      default:
        throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
    }
  } catch (error) {
    logger.error("Error processing employees request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}

async function listEmployees(event: APIGatewayProxyEvent, projectId: string) {
  getUserFromEvent(event);
  const result = await query(
    `SELECT e.id, e.project_id as "projectId", e.name, e.labor_rate_id as "laborRateId",
            e.home_branch as "homeBranch", e.project_role as "projectRole",
            e.assigned_date as "assignedDate", e.end_date as "endDate", e.is_active as "isActive",
            e.created_at as "createdAt",
            lr.code as "laborRateCode", lr.description as "laborRateDescription", lr.hourly_rate as "hourlyRate"
     FROM EMPLOYEES e JOIN LABOR_RATES lr ON lr.id = e.labor_rate_id
     WHERE e.project_id = $1 ORDER BY e.name`,
    [projectId],
  );
  return successResponse(result.rows);
}

async function createEmployee(event: APIGatewayProxyEvent, projectId: string) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  const body = validateBody(
    CreateEmployeeSchema,
    JSON.parse(event.body || "{}"),
  );

  const result = await query(
    `INSERT INTO EMPLOYEES (project_id, name, labor_rate_id, home_branch, project_role, assigned_date, end_date, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, created_at as "createdAt"`,
    [
      projectId,
      body.name,
      body.laborRateId,
      body.homeBranch,
      body.projectRole,
      body.assignedDate,
      body.endDate,
      body.isActive,
    ],
  );

  return successResponse(result.rows[0], 201);
}

async function updateEmployee(
  event: APIGatewayProxyEvent,
  projectId: string,
  employeeId: string,
) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("id", employeeId, commonSchemas.uuid);
  const body = validateBody(
    UpdateEmployeeSchema,
    JSON.parse(event.body || "{}"),
  );

  const setClauses: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (body.name !== undefined) {
    setClauses.push(`name = $${idx++}`);
    params.push(body.name);
  }
  if (body.laborRateId !== undefined) {
    setClauses.push(`labor_rate_id = $${idx++}`);
    params.push(body.laborRateId);
  }
  if (body.homeBranch !== undefined) {
    setClauses.push(`home_branch = $${idx++}`);
    params.push(body.homeBranch);
  }
  if (body.projectRole !== undefined) {
    setClauses.push(`project_role = $${idx++}`);
    params.push(body.projectRole);
  }
  if (body.assignedDate !== undefined) {
    setClauses.push(`assigned_date = $${idx++}`);
    params.push(body.assignedDate);
  }
  if (body.endDate !== undefined) {
    setClauses.push(`end_date = $${idx++}`);
    params.push(body.endDate);
  }
  if (body.isActive !== undefined) {
    setClauses.push(`is_active = $${idx++}`);
    params.push(body.isActive);
  }

  if (setClauses.length === 0)
    throw new ApiError("VALIDATION_ERROR", "No fields to update", 400);

  params.push(employeeId, projectId);
  const result = await query(
    `UPDATE EMPLOYEES SET ${setClauses.join(", ")} WHERE id = $${idx++} AND project_id = $${idx} RETURNING id`,
    params,
  );

  if (result.rows.length === 0) return notFoundResponse("Employee");
  return successResponse(result.rows[0]);
}

async function deleteEmployee(
  event: APIGatewayProxyEvent,
  projectId: string,
  employeeId: string,
) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("id", employeeId, commonSchemas.uuid);

  const result = await query(
    "DELETE FROM EMPLOYEES WHERE id = $1 AND project_id = $2 RETURNING id",
    [employeeId, projectId],
  );
  if (result.rows.length === 0) return notFoundResponse("Employee");
  return successResponse({ message: "Employee removed" }, 204);
}
