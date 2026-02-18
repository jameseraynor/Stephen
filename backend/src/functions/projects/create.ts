/**
 * Create Project Handler
 *
 * POST /projects
 * Creates a new project.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent, requireRole } from "../../shared/auth";
import { validateBody } from "../../shared/validation";
import { successResponse, errorResponse } from "../../shared/response";
import { logger } from "../../shared/logger";
import { query } from "../../shared/db";
import { z } from "zod";

/**
 * Request body schema
 */
const CreateProjectSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255, "Name too long"),
    jobNumber: z
      .string()
      .regex(
        /^\d{2}[A-Z]{3}\d{4}$/,
        "Invalid job number format (e.g., 23CON0002)",
      ),
    contractAmount: z.number().positive("Contract amount must be positive"),
    budgetedGpPct: z
      .number()
      .min(0, "GP% must be 0-100")
      .max(100, "GP% must be 0-100"),
    burdenPct: z.number().min(0, "Burden% must be positive").optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z
      .enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"])
      .default("ACTIVE"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type CreateProjectBody = z.infer<typeof CreateProjectSchema>;

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
    logger.info("Creating project", {
      path: event.path,
      method: event.httpMethod,
    });

    // Get authenticated user
    const user = getUserFromEvent(event);
    logger.appendKeys({ userId: user.userId });

    // Check authorization (only ProjectManager and Admin can create)
    requireRole(user, "ProjectManager");

    // Validate request body
    const body = validateBody(
      CreateProjectSchema,
      JSON.parse(event.body || "{}"),
    );

    logger.debug("Request body validated", { jobNumber: body.jobNumber });

    // Insert into database
    const sql = `
      INSERT INTO PROJECTS (
        name,
        job_number,
        contract_amount,
        budgeted_gp_pct,
        burden_pct,
        start_date,
        end_date,
        status,
        created_by,
        updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
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

    const params = [
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
    ];

    const result = await query(sql, params);

    logger.info("Project created", { id: result.rows[0].id });

    // Return success response
    return successResponse(result.rows[0], 201);
  } catch (error) {
    logger.error("Error creating project", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}
