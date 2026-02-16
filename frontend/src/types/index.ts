// Shared TypeScript type definitions

export interface Project {
  id: string;
  name: string;
  jobNumber: string;
  contractAmount: number;
  budgetedGpPct: number;
  burdenPct?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLine {
  id: string;
  projectId: string;
  costCodeId: string;
  costCode?: CostCode;
  description?: string;
  budgetedAmount: number;
  budgetedQuantity?: number;
  budgetedUnitCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  projectId: string;
  name: string;
  laborRateId: string;
  laborRate?: LaborRate;
  homeBranch?: string;
  projectRole?: string;
  assignedDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  employeeId: string;
  employee?: Employee;
  costCodeId: string;
  costCode?: CostCode;
  entryDate: string;
  hoursSt: number;
  hoursOt: number;
  hoursDt: number;
  source: 'MANUAL' | 'SPECTRUM';
  notes?: string;
  createdAt: string;
}

export interface Actual {
  id: string;
  projectId: string;
  costCodeId: string;
  costCode?: CostCode;
  month: string;
  actualAmount: number;
  actualQuantity?: number;
  actualUnitCost?: number;
  source: 'MANUAL' | 'SPECTRUM';
  notes?: string;
  createdAt: string;
}

export interface ProjectionSnapshot {
  id: string;
  projectId: string;
  snapshotDate: string;
  snapshotName: string;
  projectedGp: number;
  projectedGpPct: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ProjectionDetail {
  id: string;
  snapshotId: string;
  costCodeId: string;
  costCode?: CostCode;
  projectedAmount: number;
  projectedQuantity?: number;
  projectedUnitCost?: number;
  notes?: string;
}

export interface CostCode {
  id: string;
  code: string;
  description: string;
  type: 'LABOR' | 'MATERIAL' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OTHER';
  isActive: boolean;
  createdAt: string;
}

export interface LaborRate {
  id: string;
  code: string;
  description: string;
  hourlyRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  role: 'Admin' | 'ProjectManager' | 'Viewer';
  groups: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
  timestamp: string;
  requestId?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationResponse;
}
