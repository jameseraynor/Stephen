-- Migration: 004_create_labor_rates_table.sql
-- Description: Create LABOR_RATES table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE LABOR_RATES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_labor_rates_hourly_rate CHECK (hourly_rate >= 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_labor_rates_code ON LABOR_RATES(code);
CREATE INDEX idx_labor_rates_active ON LABOR_RATES(is_active);

-- Comments
COMMENT ON TABLE LABOR_RATES IS 'Labor rate definitions for employees';
COMMENT ON COLUMN LABOR_RATES.code IS 'Unique labor rate code';
COMMENT ON COLUMN LABOR_RATES.hourly_rate IS 'Hourly rate in dollars';

COMMIT;
