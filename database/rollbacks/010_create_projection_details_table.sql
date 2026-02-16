-- Rollback: 010_create_projection_details_table.sql
-- Description: Drop PROJECTION_DETAILS table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_details_cost_code_id;
DROP INDEX IF EXISTS idx_details_snapshot_id;
DROP TABLE IF EXISTS PROJECTION_DETAILS CASCADE;

COMMIT;
