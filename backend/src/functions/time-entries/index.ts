/**
 * Time Entries Lambda — Router
 *
 * Routes: /projects/{projectId}/time-entries, /time-entries/{id}, /time-entries
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

const CreateTimeEntrySchema = z
  .object({
    employeeId: z.string().uuid(),
    costCodeId: z.string().uuid(),
    entryDate: z.string(),
    hoursSt: z.number().min(0).max(24),
    hoursOt: z.number().min(0).max(24).default(0),
    hoursDt: z.number().min(0).max(24).default(0),
    notes: z.string().optional(),
  })
  .refine((d) => d.hoursSt + d.hoursOt + d.hoursDt <= 24, {
    message: "Total hours cannot exceed 24",
    path: ["hoursSt"],
  });

const UpdateTimeEntrySchema = z.object({
  hoursSt: z.number().min(0).max(24).optional(),
  hoursOt: z.number().min(0).max(24).optional(),
  hoursDt: z.number().min(0).max(24).optional(),
  notes: z.string().optional(),
});

const ListQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  date: z.string().optional(),
  costCodeId: z.string().uuid().optional(),
});

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logger.appendKeys({ requestId });
    const method = event.httpMethod;
    const projectId = event.pathParameters?.projectId;
    const entryId = event.pathParameters?.id;

    switch (method) {
      case "GET":
        return listTimeEntries(event, projectId);
      case "POST":
        if (!projectId)
          throw new ApiError("VALIDATION_ERROR", "projectId required", 400);
        return createTimeEntry(event, projectId);
      case "PUT":
        if (!entryId)
          throw new ApiError("VALIDATION_ERROR", "Entry ID required", 400);
        return updateTimeEntry(event, entryId);
      case "DELETE":
        if (!entryId)
          throw new ApiError("VALIDATION_ERROR", "Entry ID required", 400);
        return deleteTimeEntry(event, entryId);
      default:
        throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
    }
  } catch (error) {
    logger.error("Error processing time entries request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}

async function listTimeEntries(
  event: APIGatewayProxyEvent,
  projectId?: string,
) {
  getUserFromEvent(event);
  const params = validateQuery(
    ListQuerySchema,
    event.queryStringParameters || {},
  );

  let sql = `SELECT te.id, te.project_id as "projectId", te.employee_id as "employeeId",
                    te.cost_code_id as "costCodeId", te.entry_date as "entryDate",
                    te.hours_st as "hoursSt", te.hours_ot as "hoursOt", te.hours_dt as "hoursDt",
                    te.source, te.notes, te.created_at as "createdAt",
                    e.name as "employeeName", cc.code as "costCodeCode", cc.description as "costCodeDescription"
             FROM DAILY_TIME_ENTRIES te
             JOIN EMPLOYEES e ON e.id = te.employee_id
             JOIN COST_CODES cc ON cc.id = te.cost_code_id
             WHERE 1=1`;
  const qp: any[] = [];
  let idx = 1;

  if (projectId) {
    sql += ` AND te.project_id = $${idx++}`;
    qp.push(projectId);
  }
  if (params.date) {
    sql += ` AND te.entry_date = $${idx++}`;
    qp.push(params.date);
  }
  if (params.startDate) {
    sql += ` AND te.entry_date >= $${idx++}`;
    qp.push(params.startDate);
  }
  if (params.endDate) {
    sql += ` AND te.entry_date <= $${idx++}`;
    qp.push(params.endDate);
  }
  if (params.costCodeId) {
    sql += ` AND te.cost_code_id = $${idx++}`;
    qp.push(params.costCodeId);
  }

  sql += " ORDER BY te.entry_date DESC, e.name";
  const result = await query(sql, qp);
  return successResponse(result.rows);
}

async function createTimeEntry(event: APIGatewayProxyEvent, projectId: string) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("projectId", projectId, commonSchemas.uuid);
  const body = validateBody(
    CreateTimeEntrySchema,
    JSON.parse(event.body || "{}"),
  );

  const result = await query(
    `INSERT INTO DAILY_TIME_ENTRIES (project_id, employee_id, cost_code_id, entry_date, hours_st, hours_ot, hours_dt, source, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'MANUAL', $8, $9)
     RETURNING id, entry_date as "entryDate", created_at as "createdAt"`,
    [
      projectId,
      body.employeeId,
      body.costCodeId,
      body.entryDate,
      body.hoursSt,
      body.hoursOt,
      body.hoursDt,
      body.notes,
      user.userId,
    ],
  );

  return successResponse(result.rows[0], 201);
}

async function updateTimeEntry(event: APIGatewayProxyEvent, entryId: string) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("id", entryId, commonSchemas.uuid);
  const body = validateBody(
    UpdateTimeEntrySchema,
    JSON.parse(event.body || "{}"),
  );

  const setClauses: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (body.hoursSt !== undefined) {
    setClauses.push(`hours_st = $${idx++}`);
    params.push(body.hoursSt);
  }
  if (body.hoursOt !== undefined) {
    setClauses.push(`hours_ot = $${idx++}`);
    params.push(body.hoursOt);
  }
  if (body.hoursDt !== undefined) {
    setClauses.push(`hours_dt = $${idx++}`);
    params.push(body.hoursDt);
  }
  if (body.notes !== undefined) {
    setClauses.push(`notes = $${idx++}`);
    params.push(body.notes);
  }

  if (setClauses.length === 0)
    throw new ApiError("VALIDATION_ERROR", "No fields to update", 400);

  params.push(entryId);
  const result = await query(
    `UPDATE DAILY_TIME_ENTRIES SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING id`,
    params,
  );

  if (result.rows.length === 0) return notFoundResponse("Time entry");
  return successResponse(result.rows[0]);
}

async function deleteTimeEntry(event: APIGatewayProxyEvent, entryId: string) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("id", entryId, commonSchemas.uuid);

  const result = await query(
    "DELETE FROM DAILY_TIME_ENTRIES WHERE id = $1 RETURNING id",
    [entryId],
  );
  if (result.rows.length === 0) return notFoundResponse("Time entry");
  return successResponse({ message: "Time entry deleted" }, 204);
}
