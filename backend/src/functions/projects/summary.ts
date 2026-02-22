/**
 * Project Summary Lambda
 *
 * Route: GET /projects/{id}/summary
 * Separate Lambda: complex aggregation with higher memory/timeout needs.
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

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logger.appendKeys({ requestId });
    const user = getUserFromEvent(event);
    const id = validatePathParam(
      "id",
      event.pathParameters?.id,
      commonSchemas.uuid,
    );

    // Verify project exists
    const projectResult = await query(
      `SELECT id, name, job_number as "jobNumber", contract_amount as "contractAmount",
              budgeted_gp_pct as "budgetedGpPct", burden_pct as "burdenPct",
              start_date as "startDate", end_date as "endDate", status
       FROM PROJECTS WHERE id = $1`,
      [id],
    );

    if (projectResult.rows.length === 0) return notFoundResponse("Project");

    // Budget summary by cost type
    const budgetResult = await query(
      `SELECT cc.type as "costType", SUM(bl.budgeted_amount) as "totalBudget"
       FROM BUDGET_LINES bl
       JOIN COST_CODES cc ON cc.id = bl.cost_code_id
       WHERE bl.project_id = $1
       GROUP BY cc.type`,
      [id],
    );

    // Actuals summary by cost type
    const actualsResult = await query(
      `SELECT cc.type as "costType", SUM(a.actual_amount) as "totalActual"
       FROM ACTUALS a
       JOIN COST_CODES cc ON cc.id = a.cost_code_id
       WHERE a.project_id = $1
       GROUP BY cc.type`,
      [id],
    );

    // Latest projection
    const projectionResult = await query(
      `SELECT projected_gp as "projectedGp", projected_gp_pct as "projectedGpPct"
       FROM PROJECTION_SNAPSHOTS
       WHERE project_id = $1
       ORDER BY snapshot_date DESC LIMIT 1`,
      [id],
    );

    return successResponse({
      project: projectResult.rows[0],
      budgetSummary: budgetResult.rows,
      actualsSummary: actualsResult.rows,
      projectionSummary: projectionResult.rows[0] || null,
    });
  } catch (error) {
    logger.error("Error getting project summary", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}
