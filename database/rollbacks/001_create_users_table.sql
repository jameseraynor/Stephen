-- Rollback: 001_create_users_table.sql
-- Description: Drop USERS table
-- Date: 2026-02-16

BEGIN;

DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP TABLE IF EXISTS USERS CASCADE;

COMMIT;
