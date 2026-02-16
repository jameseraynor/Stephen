// Shared TypeScript type definitions for backend
import { z } from "zod";

// ============================================================================
// Zod Validation Schemas (Database Layer - snake_case)
// ============================================================================

// Project Schemas
export const ProjectStatusSchema = z.enum([
  "ACTIVE",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
]);

export const CreateProjectDbSchema = z
  .object({
    name: z.string().min(1).max(255),
    job_number: z.string().regex(/^\d{2}[A-Z]{3}\d{4}$/),
    contract_amount: z.number().positive().max(999999999.99),
    budgeted_gp_pct: z.number().min(0).max(100),
    burden_pct: z.number().min(0).optional(),
    start_date: z.string(),
    end_date: z.string(),
    status: ProjectStatusSchema.default("ACTIVE"),
    created_by: z.string().uuid(),
    updated_by: z.string().uuid(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export const UpdateProjectDbSchema = CreateProjectDbSchema.partial().omit({
  created_by: true,
});

export const ProjectDbSchema = CreateProjectDbSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Cost Code Schemas
export const CostCodeTypeSchema = z.enum([
  "LABOR",
  "MATERIAL",
  "EQUIPMENT",
  "SUBCONTRACTOR",
  "OTHER",
]);

export const CostCodeDbSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50),
  description: z.string().min(1).max(255),
  type: CostCodeTypeSchema,
  is_active: z.boolean(),
  created_at: z.date(),
});

// Budget Line Schemas
export const CreateBudgetLineDbSchema = z.object({
  project_id: z.string().uuid(),
  cost_code_id: z.string().uuid(),
  description: z.string().max(500).optional(),
  budgeted_amount: z.number().min(0),
  budgeted_quantity: z.number().min(0).optional(),
  budgeted_unit_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const UpdateBudgetLineDbSchema = CreateBudgetLineDbSchema.partial().omit(
  { project_id: true },
);

export const BudgetLineDbSchema = CreateBudgetLineDbSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Labor Rate Schemas
export const LaborRateDbSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50),
  description: z.string().min(1).max(255),
  hourly_rate: z.number().min(0),
  is_active: z.boolean(),
  created_at: z.date(),
});

// Employee Schemas
export const CreateEmployeeDbSchema = z
  .object({
    project_id: z.string().uuid(),
    name: z.string().min(1).max(255),
    labor_rate_id: z.string().uuid(),
    home_branch: z.string().max(100).optional(),
    project_role: z.string().max(100).optional(),
    assigned_date: z.string(),
    end_date: z.string().optional(),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data) =>
      !data.end_date || new Date(data.end_date) >= new Date(data.assigned_date),
    {
      message: "End date must be after assigned date",
      path: ["end_date"],
    },
  );

export const UpdateEmployeeDbSchema = CreateEmployeeDbSchema.partial().omit({
  project_id: true,
});

export const EmployeeDbSchema = CreateEmployeeDbSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
});

// Time Entry Schemas
export const TimeEntrySourceSchema = z.enum(["MANUAL", "SPECTRUM"]);

export const CreateTimeEntryDbSchema = z
  .object({
    project_id: z.string().uuid(),
    employee_id: z.string().uuid(),
    cost_code_id: z.string().uuid(),
    entry_date: z.string(),
    hours_st: z.number().min(0).max(24),
    hours_ot: z.number().min(0).max(24),
    hours_dt: z.number().min(0).max(24),
    source: TimeEntrySourceSchema.default("MANUAL"),
    notes: z.string().optional(),
  })
  .refine((data) => data.hours_st + data.hours_ot + data.hours_dt <= 24, {
    message: "Total hours cannot exceed 24",
    path: ["hours_st"],
  });

export const UpdateTimeEntryDbSchema = CreateTimeEntryDbSchema.partial().omit({
  project_id: true,
});

export const TimeEntryDbSchema = CreateTimeEntryDbSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
});

// Actual Schemas
export const CreateActualDbSchema = z.object({
  project_id: z.string().uuid(),
  cost_code_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  actual_amount: z.number().min(0),
  actual_quantity: z.number().min(0).optional(),
  actual_unit_cost: z.number().min(0).optional(),
  source: TimeEntrySourceSchema.default("MANUAL"),
  notes: z.string().optional(),
});

export const UpdateActualDbSchema = CreateActualDbSchema.partial().omit({
  project_id: true,
  month: true,
});

export const ActualDbSchema = CreateActualDbSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
});

// Projection Schemas
export const CreateProjectionSnapshotDbSchema = z.object({
  project_id: z.string().uuid(),
  snapshot_date: z.date(),
  snapshot_name: z.string().min(1).max(255),
  projected_gp: z.number(),
  projected_gp_pct: z.number().min(0).max(100),
  notes: z.string().optional(),
  created_by: z.string().uuid(),
});

export const UpdateProjectionSnapshotDbSchema =
  CreateProjectionSnapshotDbSchema.partial().omit({
    project_id: true,
    created_by: true,
  });

export const ProjectionSnapshotDbSchema =
  CreateProjectionSnapshotDbSchema.extend({
    id: z.string().uuid(),
    created_at: z.date(),
  });

export const CreateProjectionDetailDbSchema = z.object({
  snapshot_id: z.string().uuid(),
  cost_code_id: z.string().uuid(),
  projected_amount: z.number().min(0),
  projected_quantity: z.number().min(0).optional(),
  projected_unit_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const UpdateProjectionDetailDbSchema =
  CreateProjectionDetailDbSchema.partial().omit({ snapshot_id: true });

export const ProjectionDetailDbSchema = CreateProjectionDetailDbSchema.extend({
  id: z.string().uuid(),
});

// User Schemas
export const UserRoleSchema = z.enum(["Admin", "ProjectManager", "Viewer"]);

export const UserDbSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  given_name: z.string().min(1).max(100),
  family_name: z.string().min(1).max(100),
  role: UserRoleSchema,
  created_at: z.date(),
});

// API Error Schema
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string()).optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
});

// Cognito User Schema
export const CognitoUserSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  given_name: z.string(),
  family_name: z.string(),
  "cognito:groups": z.array(z.string()),
});

// ============================================================================
// TypeScript Types (inferred from Zod schemas)
// ============================================================================

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type CreateProjectDb = z.infer<typeof CreateProjectDbSchema>;
export type UpdateProjectDb = z.infer<typeof UpdateProjectDbSchema>;
export type ProjectDb = z.infer<typeof ProjectDbSchema>;

export type CostCodeType = z.infer<typeof CostCodeTypeSchema>;
export type CostCodeDb = z.infer<typeof CostCodeDbSchema>;

export type CreateBudgetLineDb = z.infer<typeof CreateBudgetLineDbSchema>;
export type UpdateBudgetLineDb = z.infer<typeof UpdateBudgetLineDbSchema>;
export type BudgetLineDb = z.infer<typeof BudgetLineDbSchema>;

export type LaborRateDb = z.infer<typeof LaborRateDbSchema>;

export type CreateEmployeeDb = z.infer<typeof CreateEmployeeDbSchema>;
export type UpdateEmployeeDb = z.infer<typeof UpdateEmployeeDbSchema>;
export type EmployeeDb = z.infer<typeof EmployeeDbSchema>;

export type TimeEntrySource = z.infer<typeof TimeEntrySourceSchema>;
export type CreateTimeEntryDb = z.infer<typeof CreateTimeEntryDbSchema>;
export type UpdateTimeEntryDb = z.infer<typeof UpdateTimeEntryDbSchema>;
export type TimeEntryDb = z.infer<typeof TimeEntryDbSchema>;

export type CreateActualDb = z.infer<typeof CreateActualDbSchema>;
export type UpdateActualDb = z.infer<typeof UpdateActualDbSchema>;
export type ActualDb = z.infer<typeof ActualDbSchema>;

export type CreateProjectionSnapshotDb = z.infer<
  typeof CreateProjectionSnapshotDbSchema
>;
export type UpdateProjectionSnapshotDb = z.infer<
  typeof UpdateProjectionSnapshotDbSchema
>;
export type ProjectionSnapshotDb = z.infer<typeof ProjectionSnapshotDbSchema>;

export type CreateProjectionDetailDb = z.infer<
  typeof CreateProjectionDetailDbSchema
>;
export type UpdateProjectionDetailDb = z.infer<
  typeof UpdateProjectionDetailDbSchema
>;
export type ProjectionDetailDb = z.infer<typeof ProjectionDetailDbSchema>;

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserDb = z.infer<typeof UserDbSchema>;

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type CognitoUser = z.infer<typeof CognitoUserSchema>;

// ============================================================================
// Legacy Types (for backward compatibility - will be removed)
// ============================================================================

export interface Project {
  id: string;
  name: string;
  job_number: string;
  contract_amount: number;
  budgeted_gp_pct: number;
  burden_pct?: number;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetLine {
  id: string;
  project_id: string;
  cost_code_id: string;
  description?: string;
  budgeted_amount: number;
  budgeted_quantity?: number;
  budgeted_unit_cost?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Employee {
  id: string;
  project_id: string;
  name: string;
  labor_rate_id: string;
  home_branch?: string;
  project_role?: string;
  assigned_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: Date;
}

export interface TimeEntry {
  id: string;
  project_id: string;
  employee_id: string;
  cost_code_id: string;
  entry_date: string;
  hours_st: number;
  hours_ot: number;
  hours_dt: number;
  source: "MANUAL" | "SPECTRUM";
  notes?: string;
  created_at: Date;
}

export interface Actual {
  id: string;
  project_id: string;
  cost_code_id: string;
  month: string;
  actual_amount: number;
  actual_quantity?: number;
  actual_unit_cost?: number;
  source: "MANUAL" | "SPECTRUM";
  notes?: string;
  created_at: Date;
}

export interface ProjectionSnapshot {
  id: string;
  project_id: string;
  snapshot_date: Date;
  snapshot_name: string;
  projected_gp: number;
  projected_gp_pct: number;
  notes?: string;
  created_by: string;
  created_at: Date;
}

export interface ProjectionDetail {
  id: string;
  snapshot_id: string;
  cost_code_id: string;
  projected_amount: number;
  projected_quantity?: number;
  projected_unit_cost?: number;
  notes?: string;
}

export interface CostCode {
  id: string;
  code: string;
  description: string;
  type: "LABOR" | "MATERIAL" | "EQUIPMENT" | "SUBCONTRACTOR" | "OTHER";
  is_active: boolean;
  created_at: Date;
}

export interface LaborRate {
  id: string;
  code: string;
  description: string;
  hourly_rate: number;
  is_active: boolean;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  role: "Admin" | "ProjectManager" | "Viewer";
  created_at: Date;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function validateCreateProject(data: unknown): CreateProjectDb {
  return CreateProjectDbSchema.parse(data);
}

export function validateUpdateProject(data: unknown): UpdateProjectDb {
  return UpdateProjectDbSchema.parse(data);
}

export function validateCreateBudgetLine(data: unknown): CreateBudgetLineDb {
  return CreateBudgetLineDbSchema.parse(data);
}

export function validateCreateEmployee(data: unknown): CreateEmployeeDb {
  return CreateEmployeeDbSchema.parse(data);
}

export function validateCreateTimeEntry(data: unknown): CreateTimeEntryDb {
  return CreateTimeEntryDbSchema.parse(data);
}

export function validateCreateActual(data: unknown): CreateActualDb {
  return CreateActualDbSchema.parse(data);
}

export function validateCreateProjectionSnapshot(
  data: unknown,
): CreateProjectionSnapshotDb {
  return CreateProjectionSnapshotDbSchema.parse(data);
}

export function validateCognitoUser(data: unknown): CognitoUser {
  return CognitoUserSchema.parse(data);
}
