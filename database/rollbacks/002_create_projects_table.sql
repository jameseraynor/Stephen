-- Rollback: 002_create_projects_table.sql
-- Description: Drop PROJECTS table
-- Date: 2026-02-16

BEGIN;

DROP TRIGGER IF EXISTS update_projects_updated_at ON PROJECTS;
DROP INDEX IF EXISTS idx_projects_dates;
DROP INDEX IF EXISTS idx_projects_created_by;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_job_number;
DROP TABLE IF EXISTS PROJECTS CASCADE;

COMMIT;
