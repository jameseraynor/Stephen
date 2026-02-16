-- Rollback: 000_create_trigger_function.sql
-- Description: Drop update_updated_at_column trigger function
-- Date: 2026-02-16

BEGIN;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;
