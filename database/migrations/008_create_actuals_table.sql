-- Migration: 008_create_actuals_table.sql
-- Description: Create ACTUALS table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE ACTUALS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  cost_code_id UUID NOT NULL,
  month VARCHAR(7) NOT NULL,
  actual_amount DECIMAL(15,2) NOT NULL,
  actual_quantity DECIMAL(10,2),
  actual_unit_cost DECIMAL(10,2),
  source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_actuals_projects 
    FOREIGN KEY (project_id) 
    REFERENCES PROJECTS(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_actuals_cost_codes 
    FOREIGN KEY (cost_code_id) 
    REFERENCES COST_CODES(id) 
    ON DELETE RESTRICT,
  CONSTRAINT chk_actuals_source CHECK (source IN ('MANUAL', 'SPECTRUM')),
  CONSTRAINT chk_actuals_month CHECK (month ~ '^\d{4}-\d{2}$'),
  CONSTRAINT chk_actuals_amount CHECK (actual_amount >= 0),
  CONSTRAINT chk_actuals_quantity CHECK (actual_quantity IS NULL OR actual_quantity >= 0),
  CONSTRAINT chk_actuals_unit_cost CHECK (actual_unit_cost IS NULL OR actual_unit_cost >= 0),
  CONSTRAINT uq_actuals UNIQUE (project_id, cost_code_id, month)
);

-- Indexes
CREATE INDEX idx_actuals_project_id ON ACTUALS(project_id);
CREATE INDEX idx_actuals_cost_code_id ON ACTUALS(cost_code_id);
CREATE INDEX idx_actuals_month ON ACTUALS(month);
CREATE INDEX idx_actuals_project_month ON ACTUALS(project_id, month);

-- Comments
COMMENT ON TABLE ACTUALS IS 'Monthly actual costs by cost code';
COMMENT ON COLUMN ACTUALS.month IS 'Month in YYYY-MM format';
COMMENT ON COLUMN ACTUALS.actual_amount IS 'Total actual amount for this cost code in this month';
COMMENT ON COLUMN ACTUALS.source IS 'Data source: MANUAL or SPECTRUM';

COMMIT;
