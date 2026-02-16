-- Migration: 006_create_employees_table.sql
-- Description: Create EMPLOYEES table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE EMPLOYEES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  labor_rate_id UUID NOT NULL,
  home_branch VARCHAR(100),
  project_role VARCHAR(100),
  assigned_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_employees_projects 
    FOREIGN KEY (project_id) 
    REFERENCES PROJECTS(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_employees_labor_rates 
    FOREIGN KEY (labor_rate_id) 
    REFERENCES LABOR_RATES(id) 
    ON DELETE RESTRICT,
  CONSTRAINT chk_employees_dates CHECK (end_date IS NULL OR end_date >= assigned_date)
);

-- Indexes
CREATE INDEX idx_employees_project_id ON EMPLOYEES(project_id);
CREATE INDEX idx_employees_labor_rate_id ON EMPLOYEES(labor_rate_id);
CREATE INDEX idx_employees_active ON EMPLOYEES(is_active);
CREATE INDEX idx_employees_project_active ON EMPLOYEES(project_id, is_active);

-- Comments
COMMENT ON TABLE EMPLOYEES IS 'Employees assigned to projects';
COMMENT ON COLUMN EMPLOYEES.home_branch IS 'Employee home branch/office';
COMMENT ON COLUMN EMPLOYEES.project_role IS 'Role on this project (e.g., Foreman, Laborer)';
COMMENT ON COLUMN EMPLOYEES.assigned_date IS 'Date employee was assigned to project';
COMMENT ON COLUMN EMPLOYEES.end_date IS 'Date employee left project (NULL if still active)';

COMMIT;
