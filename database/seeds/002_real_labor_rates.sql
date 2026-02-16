-- Seed: 002_real_labor_rates.sql
-- Description: Real labor rates from projections.xlsm (Labor_Rates sheet)
-- Date: 2026-02-16
-- Source: projections.xlsm - Labor_Rates sheet
-- Note: Rates include burden (48% burden rate applied)

BEGIN;

-- Labor rates from Citizens Medical Center project
-- Base rates with 48% burden already applied
INSERT INTO LABOR_RATES (code, description, hourly_rate, is_active) VALUES
('FORE', 'Foreman', 47.36, true),
('APP0', 'Apprentice Level 0', 37.89, true),
('APP1', 'Apprentice Level 1', 35.52, true),
('APP2', 'Apprentice Level 2', 23.68, true),
('BLEND', 'Blended Field Crew Rate', 49.00, true);

-- Notes:
-- Foreman: Base $32.00 + 48% burden = $47.36
-- App 0: Base $25.60 + 48% burden = $37.89
-- App 1: Base $24.00 + 48% burden = $35.52
-- App 2: Base $16.00 + 48% burden = $23.68
-- Blended: Average rate used in projections (from project data)

COMMIT;
