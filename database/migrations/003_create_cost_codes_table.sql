-- Migration: 003_create_cost_codes_table.sql
-- Description: Create COST_CODES table for categorizing costs
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE COST_CODES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_cost_codes_type CHECK (type IN ('LABOR', 'MATERIAL', 'EQUIPMENT', 'SUBCONTRACTOR', 'OTHER'))
);

-- Indexes
CREATE UNIQUE INDEX idx_cost_codes_code ON COST_CODES(code);
CREATE INDEX idx_cost_codes_type ON COST_CODES(type);
CREATE INDEX idx_cost_codes_active ON COST_CODES(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE COST_CODES IS 'Cost code categories for budget and actuals';
COMMENT ON COLUMN COST_CODES.code IS 'Cost code identifier (e.g., L-001, M-100)';
COMMENT ON COLUMN COST_CODES.type IS 'Cost type: LABOR, MATERIAL, EQUIPMENT, SUBCONTRACTOR, OTHER';

COMMIT;
