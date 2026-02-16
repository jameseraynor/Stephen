-- Migration: 011_create_additional_indexes.sql
-- Description: Create additional composite indexes for common queries
-- Author: System
-- Date: 2026-02-16

BEGIN;

-- Projects: Common filtering and sorting
CREATE INDEX idx_projects_status_name ON PROJECTS(status, name);
CREATE INDEX idx_projects_start_date ON PROJECTS(start_date);
CREATE INDEX idx_projects_end_date ON PROJECTS(end_date);

-- Budget Lines: Aggregation queries
CREATE INDEX idx_budget_lines_project_amount ON BUDGET_LINES(project_id, budgeted_amount);

-- Employees: Active employees by project
CREATE INDEX idx_employees_project_assigned ON EMPLOYEES(project_id, assigned_date);

-- Time Entries: Date range queries
CREATE INDEX idx_time_entries_date_range ON DAILY_TIME_ENTRIES(entry_date, project_id);
CREATE INDEX idx_time_entries_employee_date ON DAILY_TIME_ENTRIES(employee_id, entry_date);

-- Actuals: Month range queries
CREATE INDEX idx_actuals_project_cost_month ON ACTUALS(project_id, cost_code_id, month);

-- Projection Snapshots: Latest snapshots
CREATE INDEX idx_snapshots_project_latest ON PROJECTION_SNAPSHOTS(project_id, created_at DESC);

-- Comments
COMMENT ON INDEX idx_projects_status_name IS 'Optimize project list filtering and sorting';
COMMENT ON INDEX idx_budget_lines_project_amount IS 'Optimize budget aggregation queries';
COMMENT ON INDEX idx_time_entries_date_range IS 'Optimize time entry date range queries';
COMMENT ON INDEX idx_actuals_project_cost_month IS 'Optimize actuals lookup by project, cost code, and month';

COMMIT;
