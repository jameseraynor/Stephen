-- Migration: 010_create_projection_details_table.sql
-- Description: Create PROJECTION_DETAILS table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE PROJECTION_DETAILS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL,
  cost_code_id UUID NOT NULL,
  projected_amount DECIMAL(15,2) NOT NULL,
  projected_quantity DECIMAL(10,2),
  projected_unit_cost DECIMAL(10,2),
  notes TEXT,
  
  CONSTRAINT fk_details_snapshots 
    FOREIGN KEY (snapshot_id) 
    REFERENCES PROJECTION_SNAPSHOTS(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_details_cost_codes 
    FOREIGN KEY (cost_code_id) 
    REFERENCES COST_CODES(id) 
    ON DELETE RESTRICT,
  CONSTRAINT chk_details_amount CHECK (projected_amount >= 0),
  CONSTRAINT chk_details_quantity CHECK (projected_quantity IS NULL OR projected_quantity >= 0),
  CONSTRAINT chk_details_unit_cost CHECK (projected_unit_cost IS NULL OR projected_unit_cost >= 0),
  CONSTRAINT uq_projection_details UNIQUE (snapshot_id, cost_code_id)
);

-- Indexes
CREATE INDEX idx_details_snapshot_id ON PROJECTION_DETAILS(snapshot_id);
CREATE INDEX idx_details_cost_code_id ON PROJECTION_DETAILS(cost_code_id);

-- Comments
COMMENT ON TABLE PROJECTION_DETAILS IS 'Detailed cost projections by cost code for each snapshot';
COMMENT ON COLUMN PROJECTION_DETAILS.projected_amount IS 'Projected total amount for this cost code';
COMMENT ON COLUMN PROJECTION_DETAILS.projected_quantity IS 'Projected quantity (hours, units, etc.)';
COMMENT ON COLUMN PROJECTION_DETAILS.projected_unit_cost IS 'Projected cost per unit';

COMMIT;
