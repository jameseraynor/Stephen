-- Migration: 002_create_projects_table.sql
-- Description: Create PROJECTS table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE PROJECTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  job_number VARCHAR(50) NOT NULL UNIQUE,
  contract_amount DECIMAL(15,2) NOT NULL,
  budgeted_gp_pct DECIMAL(5,2) NOT NULL,
  burden_pct DECIMAL(5,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES USERS(id) ON DELETE RESTRICT,
  CONSTRAINT fk_projects_updated_by FOREIGN KEY (updated_by) REFERENCES USERS(id) ON DELETE RESTRICT,
  CONSTRAINT chk_projects_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED')),
  CONSTRAINT chk_projects_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_projects_contract_amount CHECK (contract_amount > 0),
  CONSTRAINT chk_projects_gp_pct CHECK (budgeted_gp_pct BETWEEN 0 AND 100),
  CONSTRAINT chk_projects_burden_pct CHECK (burden_pct IS NULL OR burden_pct >= 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_projects_job_number ON PROJECTS(job_number);
CREATE INDEX idx_projects_status ON PROJECTS(status);
CREATE INDEX idx_projects_created_by ON PROJECTS(created_by);
CREATE INDEX idx_projects_dates ON PROJECTS(start_date, end_date);

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON PROJECTS 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE PROJECTS IS 'Construction projects';
COMMENT ON COLUMN PROJECTS.job_number IS 'Unique project identifier (e.g., 23CON0002)';
COMMENT ON COLUMN PROJECTS.contract_amount IS 'Total contract value';
COMMENT ON COLUMN PROJECTS.budgeted_gp_pct IS 'Budgeted gross profit percentage';
COMMENT ON COLUMN PROJECTS.burden_pct IS 'Labor burden percentage';

COMMIT;
