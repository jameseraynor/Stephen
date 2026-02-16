-- Rollback: 006_create_employees_table.sql
-- Description: Drop EMPLOYEES table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_employees_project_active;
DROP INDEX IF EXISTS idx_employees_active;
DROP INDEX IF EXISTS idx_employees_labor_rate_id;
DROP INDEX IF EXISTS idx_employees_project_id;
DROP TABLE IF EXISTS EMPLOYEES CASCADE;

COMMIT;
