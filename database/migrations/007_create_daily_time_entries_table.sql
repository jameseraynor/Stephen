-- Migration: 007_create_daily_time_entries_table.sql
-- Description: Create DAILY_TIME_ENTRIES table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE DAILY_TIME_ENTRIES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  cost_code_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  hours_st DECIMAL(10,2) NOT NULL DEFAULT 0,
  hours_ot DECIMAL(10,2) NOT NULL DEFAULT 0,
  hours_dt DECIMAL(10,2) NOT NULL DEFAULT 0,
  source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_time_entries_projects 
    FOREIGN KEY (project_id) 
    REFERENCES PROJECTS(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_time_entries_employees 
    FOREIGN KEY (employee_id) 
    REFERENCES EMPLOYEES(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_time_entries_cost_codes 
    FOREIGN KEY (cost_code_id) 
    REFERENCES COST_CODES(id) 
    ON DELETE RESTRICT,
  CONSTRAINT chk_time_entries_source CHECK (source IN ('MANUAL', 'SPECTRUM')),
  CONSTRAINT chk_time_entries_hours_st CHECK (hours_st >= 0),
  CONSTRAINT chk_time_entries_hours_ot CHECK (hours_ot >= 0),
  CONSTRAINT chk_time_entries_hours_dt CHECK (hours_dt >= 0),
  CONSTRAINT uq_time_entries UNIQUE (project_id, employee_id, entry_date, cost_code_id)
);

-- Indexes
CREATE INDEX idx_time_entries_project_id ON DAILY_TIME_ENTRIES(project_id);
CREATE INDEX idx_time_entries_employee_id ON DAILY_TIME_ENTRIES(employee_id);
CREATE INDEX idx_time_entries_cost_code_id ON DAILY_TIME_ENTRIES(cost_code_id);
CREATE INDEX idx_time_entries_entry_date ON DAILY_TIME_ENTRIES(entry_date);
CREATE INDEX idx_time_entries_project_date ON DAILY_TIME_ENTRIES(project_id, entry_date);

-- Comments
COMMENT ON TABLE DAILY_TIME_ENTRIES IS 'Daily time entries for employees';
COMMENT ON COLUMN DAILY_TIME_ENTRIES.hours_st IS 'Straight time hours';
COMMENT ON COLUMN DAILY_TIME_ENTRIES.hours_ot IS 'Overtime hours (1.5x)';
COMMENT ON COLUMN DAILY_TIME_ENTRIES.hours_dt IS 'Double time hours (2x)';
COMMENT ON COLUMN DAILY_TIME_ENTRIES.source IS 'Data source: MANUAL or SPECTRUM';

COMMIT;
