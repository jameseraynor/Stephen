/**
 * Projections Lambda — Router
 *
 * Routes: /projects/{projectId}/projections, /projects/{projectId}/projections/{snapshotId}
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
import { query, transaction } from "../../shared/db";
import { z } from "zod";

const ProjectionDetailSchema = z.object({
  costCodeId: z.string().uuid(),
  projectedAmount: z.number().min(0),
  projectedQuantity: z.number().min(0).optional(),
  projectedUnitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const CreateSnapshotSchema = z.object({
  snapshotName: z.string().min(1).max(255),
  notes: z.string().optional(),
  details: z.array(ProjectionDetailSchema).min(1),
});

const UpdateSnapshotSchema = z.object({
  snapshotName: z.string().min(1).max(255).optional(),
  notes: z.string().optional(),
});

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
    const snapshotId = event.pathParameters?.snapshotId;

    switch (method) {
      case "GET":
        return snapshotId
          ? getSnapshot(event, projectId, snapshotId)
          : listSnapshots(event, projectId);
      case "POST":
        return createSnapshot(event, projectId);
      case "PUT":
        if (!snapshotId)
          throw new ApiError("VALIDATION_ERROR", "snapshotId required", 400);
        return updateSnapshot(event, projectId, snapshotId);
      case "DELETE":
        if (!snapshotId)
          throw new ApiError("VALIDATION_ERROR", "snapshotId required", 400);
        return deleteSnapshot(event, projectId, snapshotId);
      default:
        throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
    }
  } catch (error) {
    logger.error("Error processing projections request", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}

async function listSnapshots(event: APIGatewayProxyEvent, projectId: string) {
  getUserFromEvent(event);
  const result = await query(
    `SELECT id, project_id as "projectId", snapshot_date as "snapshotDate",
            snapshot_name as "snapshotName", projected_gp as "projectedGp",
            projected_gp_pct as "projectedGpPct", notes, created_by as "createdBy",
            created_at as "createdAt"
     FROM PROJECTION_SNAPSHOTS WHERE project_id = $1 ORDER BY snapshot_date DESC`,
    [projectId],
  );
  return successResponse(result.rows);
}

async function getSnapshot(
  event: APIGatewayProxyEvent,
  projectId: string,
  snapshotId: string,
) {
  getUserFromEvent(event);
  validatePathParam("snapshotId", snapshotId, commonSchemas.uuid);

  const snapshotResult = await query(
    `SELECT id, project_id as "projectId", snapshot_date as "snapshotDate",
            snapshot_name as "snapshotName", projected_gp as "projectedGp",
            projected_gp_pct as "projectedGpPct", notes, created_by as "createdBy",
            created_at as "createdAt"
     FROM PROJECTION_SNAPSHOTS WHERE id = $1 AND project_id = $2`,
    [snapshotId, projectId],
  );

  if (snapshotResult.rows.length === 0)
    return notFoundResponse("Projection snapshot");

  const detailsResult = await query(
    `SELECT pd.id, pd.cost_code_id as "costCodeId", pd.projected_amount as "projectedAmount",
            pd.projected_quantity as "projectedQuantity", pd.projected_unit_cost as "projectedUnitCost",
            pd.notes, cc.code as "costCodeCode", cc.description as "costCodeDescription"
     FROM PROJECTION_DETAILS pd
     JOIN COST_CODES cc ON cc.id = pd.cost_code_id
     WHERE pd.snapshot_id = $1 ORDER BY cc.code`,
    [snapshotId],
  );

  return successResponse({
    snapshot: snapshotResult.rows[0],
    details: detailsResult.rows,
  });
}

async function createSnapshot(event: APIGatewayProxyEvent, projectId: string) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  const body = validateBody(
    CreateSnapshotSchema,
    JSON.parse(event.body || "{}"),
  );

  // Calculate totals from details
  const totalProjected = body.details.reduce(
    (sum, d) => sum + d.projectedAmount,
    0,
  );

  // Get contract amount for GP% calculation
  const projectResult = await query(
    "SELECT contract_amount FROM PROJECTS WHERE id = $1",
    [projectId],
  );
  if (projectResult.rows.length === 0) return notFoundResponse("Project");

  const contractAmount = projectResult.rows[0].contract_amount;
  const projectedGp = contractAmount - totalProjected;
  const projectedGpPct =
    contractAmount > 0 ? (projectedGp / contractAmount) * 100 : 0;

  const snapshotId = await transaction(async (client) => {
    const snapResult = await client.query(
      `INSERT INTO PROJECTION_SNAPSHOTS (project_id, snapshot_date, snapshot_name, projected_gp, projected_gp_pct, notes, created_by)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        projectId,
        body.snapshotName,
        projectedGp,
        projectedGpPct,
        body.notes,
        user.userId,
      ],
    );

    const id = snapResult.rows[0].id;

    for (const detail of body.details) {
      await client.query(
        `INSERT INTO PROJECTION_DETAILS (snapshot_id, cost_code_id, projected_amount, projected_quantity, projected_unit_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          detail.costCodeId,
          detail.projectedAmount,
          detail.projectedQuantity,
          detail.projectedUnitCost,
          detail.notes,
        ],
      );
    }

    return id;
  });

  return successResponse({ id: snapshotId }, 201);
}

async function updateSnapshot(
  event: APIGatewayProxyEvent,
  projectId: string,
  snapshotId: string,
) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("snapshotId", snapshotId, commonSchemas.uuid);
  const body = validateBody(
    UpdateSnapshotSchema,
    JSON.parse(event.body || "{}"),
  );

  const setClauses: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (body.snapshotName !== undefined) {
    setClauses.push(`snapshot_name = $${idx++}`);
    params.push(body.snapshotName);
  }
  if (body.notes !== undefined) {
    setClauses.push(`notes = $${idx++}`);
    params.push(body.notes);
  }

  if (setClauses.length === 0)
    throw new ApiError("VALIDATION_ERROR", "No fields to update", 400);

  params.push(snapshotId, projectId);
  const result = await query(
    `UPDATE PROJECTION_SNAPSHOTS SET ${setClauses.join(", ")} WHERE id = $${idx++} AND project_id = $${idx} RETURNING id`,
    params,
  );

  if (result.rows.length === 0) return notFoundResponse("Projection snapshot");
  return successResponse(result.rows[0]);
}

async function deleteSnapshot(
  event: APIGatewayProxyEvent,
  projectId: string,
  snapshotId: string,
) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  validatePathParam("snapshotId", snapshotId, commonSchemas.uuid);

  const result = await query(
    "DELETE FROM PROJECTION_SNAPSHOTS WHERE id = $1 AND project_id = $2 RETURNING id",
    [snapshotId, projectId],
  );

  if (result.rows.length === 0) return notFoundResponse("Projection snapshot");
  return successResponse({ message: "Projection deleted" }, 204);
}
