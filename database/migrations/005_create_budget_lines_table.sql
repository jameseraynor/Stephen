-- Migration: 005_create_budget_lines_table.sql
-- Description: Create BUDGET_LINES table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE BUDGET_LINES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  cost_code_id UUID NOT NULL,
  description VARCHAR(500),
  budgeted_amount DECIMAL(15,2) NOT NULL,
  budgeted_quantity DECIMAL(10,2),
  budgeted_unit_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_budget_lines_projects 
    FOREIGN KEY (project_id) 
    REFERENCES PROJECTS(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_budget_lines_cost_codes 
    FOREIGN KEY (cost_code_id) 
    REFERENCES COST_CODES(id) 
    ON DELETE RESTRICT,
  CONSTRAINT chk_budget_lines_amount CHECK (budgeted_amount >= 0),
  CONSTRAINT chk_budget_lines_quantity CHECK (budgeted_quantity IS NULL OR budgeted_quantity >= 0),
  CONSTRAINT chk_budget_lines_unit_cost CHECK (budgeted_unit_cost IS NULL OR budgeted_unit_cost >= 0)
);

-- Indexes
CREATE INDEX idx_budget_lines_project_id ON BUDGET_LINES(project_id);
CREATE INDEX idx_budget_lines_cost_code_id ON BUDGET_LINES(cost_code_id);
CREATE INDEX idx_budget_lines_project_cost_code ON BUDGET_LINES(project_id, cost_code_id);

-- Trigger for updated_at
CREATE TRIGGER update_budget_lines_updated_at 
  BEFORE UPDATE ON BUDGET_LINES 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE BUDGET_LINES IS 'Budget line items for projects';
COMMENT ON COLUMN BUDGET_LINES.budgeted_amount IS 'Total budgeted amount for this line';
COMMENT ON COLUMN BUDGET_LINES.budgeted_quantity IS 'Budgeted quantity (hours, units, etc.)';
COMMENT ON COLUMN BUDGET_LINES.budgeted_unit_cost IS 'Budgeted cost per unit';

COMMIT;
