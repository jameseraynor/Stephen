-- Migration: 001_create_users_table.sql
-- Description: Create USERS table for authentication
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE USERS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  given_name VARCHAR(100) NOT NULL,
  family_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Viewer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_users_role CHECK (role IN ('Admin', 'ProjectManager', 'Viewer'))
);

-- Indexes
CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_users_role ON USERS(role);

-- Comments
COMMENT ON TABLE USERS IS 'User accounts synced from Cognito';
COMMENT ON COLUMN USERS.id IS 'Matches Cognito sub (user ID)';
COMMENT ON COLUMN USERS.role IS 'User role: Admin, ProjectManager, or Viewer';

COMMIT;
