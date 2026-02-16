// Shared TypeScript type definitions
import { z } from "zod";

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// Project Schemas
export const ProjectStatusSchema = z.enum([
  "ACTIVE",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
]);

export const CreateProjectSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255, "Name too long"),
    jobNumber: z
      .string()
      .regex(
        /^\d{2}[A-Z]{3}\d{4}$/,
        "Invalid job number format (e.g., 23CON0002)",
      ),
    contractAmount: z
      .number()
      .positive("Contract amount must be positive")
      .max(999999999.99),
    budgetedGpPct: z
      .number()
      .min(0, "GP% must be 0-100")
      .max(100, "GP% must be 0-100"),
    burdenPct: z.number().min(0, "Burden% must be positive").optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: ProjectStatusSchema.default("ACTIVE"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const ProjectSchema = CreateProjectSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Cost Code Schemas
export const CostCodeTypeSchema = z.enum([
  "LABOR",
  "MATERIAL",
  "EQUIPMENT",
  "SUBCONTRACTOR",
  "OTHER",
]);

export const CostCodeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50),
  description: z.string().min(1).max(255),
  type: CostCodeTypeSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

// Budget Line Schemas
export const CreateBudgetLineSchema = z.object({
  projectId: z.string().uuid(),
  costCodeId: z.string().uuid(),
  description: z.string().max(500).optional(),
  budgetedAmount: z.number().min(0, "Amount must be positive"),
  budgetedQuantity: z.number().min(0).optional(),
  budgetedUnitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const UpdateBudgetLineSchema = CreateBudgetLineSchema.partial().omit({
  projectId: true,
});

export const BudgetLineSchema = CreateBudgetLineSchema.extend({
  id: z.string().uuid(),
  costCode: CostCodeSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Labor Rate Schemas
export const LaborRateSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50),
  description: z.string().min(1).max(255),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

// Employee Schemas
export const CreateEmployeeSchema = z
  .object({
    projectId: z.string().uuid(),
    name: z.string().min(1, "Name is required").max(255),
    laborRateId: z.string().uuid(),
    homeBranch: z.string().max(100).optional(),
    projectRole: z.string().max(100).optional(),
    assignedDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) =>
      !data.endDate || new Date(data.endDate) >= new Date(data.assignedDate),
    {
      message: "End date must be after assigned date",
      path: ["endDate"],
    },
  );

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().omit({
  projectId: true,
});

export const EmployeeSchema = CreateEmployeeSchema.extend({
  id: z.string().uuid(),
  laborRate: LaborRateSchema.optional(),
  createdAt: z.string().datetime(),
});

// Time Entry Schemas
export const TimeEntrySourceSchema = z.enum(["MANUAL", "SPECTRUM"]);

export const CreateTimeEntrySchema = z
  .object({
    projectId: z.string().uuid(),
    employeeId: z.string().uuid(),
    costCodeId: z.string().uuid(),
    entryDate: z.string().datetime(),
    hoursSt: z
      .number()
      .min(0, "Hours must be positive")
      .max(24, "Hours cannot exceed 24"),
    hoursOt: z
      .number()
      .min(0, "Hours must be positive")
      .max(24, "Hours cannot exceed 24"),
    hoursDt: z
      .number()
      .min(0, "Hours must be positive")
      .max(24, "Hours cannot exceed 24"),
    source: TimeEntrySourceSchema.default("MANUAL"),
    notes: z.string().optional(),
  })
  .refine((data) => data.hoursSt + data.hoursOt + data.hoursDt <= 24, {
    message: "Total hours cannot exceed 24",
    path: ["hoursSt"],
  });

export const UpdateTimeEntrySchema = CreateTimeEntrySchema.partial().omit({
  projectId: true,
});

export const TimeEntrySchema = CreateTimeEntrySchema.extend({
  id: z.string().uuid(),
  employee: EmployeeSchema.optional(),
  costCode: CostCodeSchema.optional(),
  createdAt: z.string().datetime(),
});

// Actual Schemas
export const CreateActualSchema = z.object({
  projectId: z.string().uuid(),
  costCodeId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  actualAmount: z.number().min(0, "Amount must be positive"),
  actualQuantity: z.number().min(0).optional(),
  actualUnitCost: z.number().min(0).optional(),
  source: TimeEntrySourceSchema.default("MANUAL"),
  notes: z.string().optional(),
});

export const UpdateActualSchema = CreateActualSchema.partial().omit({
  projectId: true,
  month: true,
});

export const ActualSchema = CreateActualSchema.extend({
  id: z.string().uuid(),
  costCode: CostCodeSchema.optional(),
  createdAt: z.string().datetime(),
});

// Projection Schemas
export const CreateProjectionSnapshotSchema = z.object({
  projectId: z.string().uuid(),
  snapshotDate: z.string().datetime(),
  snapshotName: z.string().min(1, "Name is required").max(255),
  projectedGp: z.number(),
  projectedGpPct: z.number().min(0).max(100),
  notes: z.string().optional(),
});

export const UpdateProjectionSnapshotSchema =
  CreateProjectionSnapshotSchema.partial().omit({ projectId: true });

export const ProjectionSnapshotSchema = CreateProjectionSnapshotSchema.extend({
  id: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CreateProjectionDetailSchema = z.object({
  snapshotId: z.string().uuid(),
  costCodeId: z.string().uuid(),
  projectedAmount: z.number().min(0),
  projectedQuantity: z.number().min(0).optional(),
  projectedUnitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const UpdateProjectionDetailSchema =
  CreateProjectionDetailSchema.partial().omit({ snapshotId: true });

export const ProjectionDetailSchema = CreateProjectionDetailSchema.extend({
  id: z.string().uuid(),
  costCode: CostCodeSchema.optional(),
});

// User Schemas
export const UserRoleSchema = z.enum(["Admin", "ProjectManager", "Viewer"]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  givenName: z.string().min(1).max(100),
  familyName: z.string().min(1).max(100),
  role: UserRoleSchema,
  groups: z.array(z.string()),
});

// API Schemas
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const PaginationResponseSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  totalPages: z.number().int(),
  totalItems: z.number().int(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.string()).optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

// ============================================================================
// TypeScript Types (inferred from Zod schemas)
// ============================================================================

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;

export type CostCodeType = z.infer<typeof CostCodeTypeSchema>;
export type CostCode = z.infer<typeof CostCodeSchema>;

export type CreateBudgetLine = z.infer<typeof CreateBudgetLineSchema>;
export type UpdateBudgetLine = z.infer<typeof UpdateBudgetLineSchema>;
export type BudgetLine = z.infer<typeof BudgetLineSchema>;

export type LaborRate = z.infer<typeof LaborRateSchema>;

export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;

export type TimeEntrySource = z.infer<typeof TimeEntrySourceSchema>;
export type CreateTimeEntry = z.infer<typeof CreateTimeEntrySchema>;
export type UpdateTimeEntry = z.infer<typeof UpdateTimeEntrySchema>;
export type TimeEntry = z.infer<typeof TimeEntrySchema>;

export type CreateActual = z.infer<typeof CreateActualSchema>;
export type UpdateActual = z.infer<typeof UpdateActualSchema>;
export type Actual = z.infer<typeof ActualSchema>;

export type CreateProjectionSnapshot = z.infer<
  typeof CreateProjectionSnapshotSchema
>;
export type UpdateProjectionSnapshot = z.infer<
  typeof UpdateProjectionSnapshotSchema
>;
export type ProjectionSnapshot = z.infer<typeof ProjectionSnapshotSchema>;

export type CreateProjectionDetail = z.infer<
  typeof CreateProjectionDetailSchema
>;
export type UpdateProjectionDetail = z.infer<
  typeof UpdateProjectionDetailSchema
>;
export type ProjectionDetail = z.infer<typeof ProjectionDetailSchema>;

export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationResponse;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function validateProject(data: unknown): CreateProject {
  return CreateProjectSchema.parse(data);
}

export function validateBudgetLine(data: unknown): CreateBudgetLine {
  return CreateBudgetLineSchema.parse(data);
}

export function validateEmployee(data: unknown): CreateEmployee {
  return CreateEmployeeSchema.parse(data);
}

export function validateTimeEntry(data: unknown): CreateTimeEntry {
  return CreateTimeEntrySchema.parse(data);
}

export function validateActual(data: unknown): CreateActual {
  return CreateActualSchema.parse(data);
}

export function validateProjectionSnapshot(
  data: unknown,
): CreateProjectionSnapshot {
  return CreateProjectionSnapshotSchema.parse(data);
}

export function validatePaginationParams(data: unknown): PaginationParams {
  return PaginationParamsSchema.parse(data);
}
