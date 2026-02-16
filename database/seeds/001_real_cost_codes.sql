-- Seed: 001_real_cost_codes.sql
-- Description: Real cost codes from projections.xlsm (CostCodes_Master sheet)
-- Date: 2026-02-16
-- Source: projections.xlsm - CostCodes_Master

BEGIN;

-- Cost Codes from Citizens Medical Center project
INSERT INTO COST_CODES (code, description, type, is_active) VALUES
-- Project Management
('00-001', 'PRECONSTRUCTION', 'LABOR', true),
('00-003', 'PURCHASING', 'LABOR', true),
('00-004', 'SAFETY & QA/QC', 'LABOR', true),
('00-005', 'ESTIMATING', 'LABOR', true),
('00-006', 'PROJECT ASSISTANT', 'LABOR', true),
('00-007', 'PROJECT MANAGER', 'LABOR', true),
('00-101', 'REWORK', 'LABOR', true),

-- Labor - General
('00-002', 'MOBILIZATION', 'LABOR', true),
('00-008', 'FM PLANNING & BUDGET', 'LABOR', true),
('00-009', 'OFFSITE FM PLANNING', 'LABOR', true),
('00-270', 'DEMO', 'LABOR', true),

-- Electrical - Underground & Rough-In
('00-103', 'UG BRANCH ROUGH-IN', 'LABOR', true),
('00-104', 'IN-WALL BRANCH ROUGH-IN', 'LABOR', true),
('00-105', 'BRANCH ROUGH IN', 'LABOR', true),
('00-108', 'UG FEEDER ROUGH-IN', 'LABOR', true),
('00-109', 'IN-WALL FEEDER ROUGH-IN', 'LABOR', true),
('00-110', 'FEEDER CONDUIT ROUGH IN', 'LABOR', true),

-- Electrical - Wiring
('00-120', 'BRANCH WIRES', 'LABOR', true),
('00-125', 'MC CABLE', 'LABOR', true),
('00-130', 'FEDDER WIRE #6+', 'LABOR', true),

-- Electrical - Equipment & Connections
('00-140', 'EQUIPMENT & CONNECTIONS', 'LABOR', true),
('00-150', 'EQUIPMENT & CONNECTIONS', 'LABOR', true),
('00-155', 'GROUNDING & BONDING', 'LABOR', true),

-- Electrical - Fixtures & Devices
('00-160', 'LIGHT FIXTURES & LAMPS', 'LABOR', true),
('00-170', 'DEVICES AND PLATES', 'LABOR', true),

-- Electrical - Special Systems
('00-180', 'SPECIAL RACEWAYS WIRE/MOL', 'LABOR', true),
('00-195', 'ELECTRIC HEAT', 'LABOR', true),
('00-200', 'GENERATOR', 'LABOR', true),
('00-210', 'FIRE ALARM/SPECIAL SYSTEM', 'LABOR', true),
('00-217', 'SOLAR BY BEC', 'LABOR', true),
('00-240', 'LIGHTING PROTECTION', 'LABOR', true),
('00-250', 'UPS & RELATED', 'LABOR', true),
('00-280', 'MED. & HIGH VOLTAGE', 'LABOR', true),

-- Communications & Data
('00-290', 'DATA COMMUNICATION', 'LABOR', true),
('00-291', 'FIBER COMMUNICATIONS', 'LABOR', true),
('00-292', 'NURSE CALL', 'LABOR', true),
('00-293', 'SOUND MASKING', 'LABOR', true),
('00-294', 'MED GAS CABLING', 'LABOR', true),

-- Subcontractors
('00-151', 'Commissioning', 'SUBCONTRACTOR', true),
('00-215', 'PA/PAGING SYSTEM', 'SUBCONTRACTOR', true),
('00-295', 'CLOCKS', 'SUBCONTRACTOR', true),

-- Equipment
('00-100', 'TEMP POWER & LIGHT', 'EQUIPMENT', true),

-- Materials
('00-260', 'CONCRETE', 'MATERIAL', true),

-- Other
('00-220', 'FLOOR BOXES', 'OTHER', true),
('00-230', 'EXCAVATION AND BACKFILL', 'OTHER', true),
('00-300', 'SMALL CHANGE ORDER', 'OTHER', true),
('00-400', 'MISCELLANEOUS', 'OTHER', true);

COMMIT;
