-- Rollback: 007_create_daily_time_entries_table.sql
-- Description: Drop DAILY_TIME_ENTRIES table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_time_entries_project_date;
DROP INDEX IF EXISTS idx_time_entries_entry_date;
DROP INDEX IF EXISTS idx_time_entries_cost_code_id;
DROP INDEX IF EXISTS idx_time_entries_employee_id;
DROP INDEX IF EXISTS idx_time_entries_project_id;
DROP TABLE IF EXISTS DAILY_TIME_ENTRIES CASCADE;

COMMIT;
