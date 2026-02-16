-- Rollback: 009_create_projection_snapshots_table.sql
-- Description: Drop PROJECTION_SNAPSHOTS table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_snapshots_project_date;
DROP INDEX IF EXISTS idx_snapshots_snapshot_date;
DROP INDEX IF EXISTS idx_snapshots_created_by;
DROP INDEX IF EXISTS idx_snapshots_project_id;
DROP TABLE IF EXISTS PROJECTION_SNAPSHOTS CASCADE;

COMMIT;
