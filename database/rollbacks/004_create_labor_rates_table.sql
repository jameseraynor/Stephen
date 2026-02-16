-- Rollback: 004_create_labor_rates_table.sql
-- Description: Drop LABOR_RATES table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_labor_rates_active;
DROP INDEX IF EXISTS idx_labor_rates_code;
DROP TABLE IF EXISTS LABOR_RATES CASCADE;

COMMIT;
