-- Rollback: 005_create_budget_lines_table.sql
-- Description: Drop BUDGET_LINES table
-- Date: 2026-02-16

BEGIN;

DROP TRIGGER IF EXISTS update_budget_lines_updated_at ON BUDGET_LINES;
DROP INDEX IF EXISTS idx_budget_lines_project_cost_code;
DROP INDEX IF EXISTS idx_budget_lines_cost_code_id;
DROP INDEX IF EXISTS idx_budget_lines_project_id;
DROP TABLE IF EXISTS BUDGET_LINES CASCADE;

COMMIT;
