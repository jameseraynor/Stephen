-- Seed: 003_real_project.sql
-- Description: Real project data from projections.xlsm
-- Date: 2026-02-16
-- Source: projections.xlsm - Projections sheet
-- Note: Requires a user to exist first

BEGIN;

-- Create a test user if not exists (for development only)
INSERT INTO USERS (id, email, given_name, family_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'Admin',
  'User',
  'Admin'
) ON CONFLICT (email) DO NOTHING;

-- Real project: Citizens Medical Center
-- Data extracted from projections.xlsm
INSERT INTO PROJECTS (
  name,
  job_number,
  contract_amount,
  budgeted_gp_pct,
  burden_pct,
  start_date,
  end_date,
  status,
  created_by,
  updated_by
) VALUES (
  'Citizens Medical Center',
  '23CON0002',
  15190206.00,  -- Contract + Approved COs: $15,190,206
  31.5,         -- Budgeted GP: 31.5%
  48.0,         -- Burden percentage: 48%
  '2023-03-01', -- Estimated start (not in Excel, using reasonable date)
  '2025-12-10', -- Project Completion Date from Excel
  'ACTIVE',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001'
);

-- Project Details from Excel:
-- Original Contract Amount: $14,865,999
-- Approved Change Orders: $324,207
-- Contract + Approved COs: $15,190,206
-- Budgeted GP%: 31.5%
-- Last Projection GP%: 16.1%
-- Current Labor Rate: $54.75 (burdened)
-- Budgeted Labor Cost: $2,245,256.44
-- Current Projected Labor Cost: $4,908,095.36
-- JTD Hours (Labor Hours Only): 87,895.93
-- Projected Field Hrs Remaining: 2,156
-- Projected Average Crew Size: 26

COMMIT;
