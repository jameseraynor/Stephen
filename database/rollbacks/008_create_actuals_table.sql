-- Rollback: 008_create_actuals_table.sql
-- Description: Drop ACTUALS table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_actuals_project_month;
DROP INDEX IF EXISTS idx_actuals_month;
DROP INDEX IF EXISTS idx_actuals_cost_code_id;
DROP INDEX IF EXISTS idx_actuals_project_id;
DROP TABLE IF EXISTS ACTUALS CASCADE;

COMMIT;
