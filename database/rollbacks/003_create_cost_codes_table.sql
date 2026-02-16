-- Rollback: 003_create_cost_codes_table.sql
-- Description: Drop COST_CODES table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_cost_codes_type;
DROP INDEX IF EXISTS idx_cost_codes_active;
DROP INDEX IF EXISTS idx_cost_codes_code;
DROP TABLE IF EXISTS COST_CODES CASCADE;

COMMIT;
