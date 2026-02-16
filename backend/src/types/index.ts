// Shared TypeScript type definitions for backend

export interface Project {
  id: string;
  name: string;
  job_number: string;
  contract_amount: number;
  budgeted_gp_pct: number;
  burden_pct?: number;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
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
  source: 'MANUAL' | 'SPECTRUM';
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
  source: 'MANUAL' | 'SPECTRUM';
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
  type: 'LABOR' | 'MATERIAL' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OTHER';
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
  role: 'Admin' | 'ProjectManager' | 'Viewer';
  created_at: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
  timestamp: string;
  requestId?: string;
}

export interface CognitoUser {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  'cognito:groups': string[];
}
