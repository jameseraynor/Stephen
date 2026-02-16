-- Rollback: 011_create_additional_indexes.sql
-- Description: Drop additional composite indexes
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_snapshots_project_latest;
DROP INDEX IF EXISTS idx_actuals_project_cost_month;
DROP INDEX IF EXISTS idx_time_entries_employee_date;
DROP INDEX IF EXISTS idx_time_entries_date_range;
DROP INDEX IF EXISTS idx_employees_project_assigned;
DROP INDEX IF EXISTS idx_budget_lines_project_amount;
DROP INDEX IF EXISTS idx_projects_end_date;
DROP INDEX IF EXISTS idx_projects_start_date;
DROP INDEX IF EXISTS idx_projects_status_name;

COMMIT;
