# Database Seeds

This directory contains SQL seed files to populate the database with initial data for development and testing.

## Seed Files (Real Data)

### 001_real_cost_codes.sql

**Source**: `projections.xlsm` - CostCodes_Master sheet

Contains 47 real cost codes extracted from the Citizens Medical Center project:

- Project Management codes (00-001 to 00-007)
- Electrical rough-in and wiring (00-103 to 00-130)
- Equipment & connections (00-140 to 00-155)
- Fixtures & devices (00-160 to 00-170)
- Special systems (00-180 to 00-280)
- Communications & data (00-290 to 00-294)
- Subcontractors (00-151, 00-215, 00-295)
- Equipment, materials, and other (00-100, 00-260, 00-220, etc.)

All codes are categorized as: LABOR, MATERIAL, EQUIPMENT, SUBCONTRACTOR, or OTHER

### 002_real_labor_rates.sql

**Source**: `projections.xlsm` - Labor_Rates sheet

Contains 5 real labor rate classifications with 48% burden applied:

- **Foreman (FORE)**: $47.36/hr (base $32.00 + 48% burden)
- **Apprentice Level 0 (APP0)**: $37.89/hr (base $25.60 + 48% burden)
- **Apprentice Level 1 (APP1)**: $35.52/hr (base $24.00 + 48% burden)
- **Apprentice Level 2 (APP2)**: $23.68/hr (base $16.00 + 48% burden)
- **Blended Field Crew (BLEND)**: $49.00/hr (average rate from project)

### 003_real_project.sql

**Source**: `projections.xlsm` - Projections sheet

Contains the real Citizens Medical Center project:

- **Job Number**: 23CON0002
- **Contract + Approved COs**: $15,190,206
  - Original Contract: $14,865,999
  - Approved Change Orders: $324,207
- **Budgeted GP%**: 31.5%
- **Last Projection GP%**: 16.1%
- **Burden Rate**: 48%
- **Completion Date**: December 10, 2025
- **Current Labor Rate**: $54.75/hr (burdened)
- **JTD Hours**: 87,895.93
- **Projected Remaining Hours**: 2,156
- **Average Crew Size**: 26

## Backup Files (Examples)

The following files are generic examples kept for reference:

- `999_example_cost_codes.sql.bak` - Generic cost code examples
- `999_example_labor_rates.sql.bak` - Generic labor rate examples
- `999_example_projects.sql.bak` - Generic project examples

These are NOT loaded by the seed script (`.bak` extension prevents loading).

## Running Seeds

To seed the database with real data:

```bash
# From project root
./database/scripts/seed-db.sh
```

This will:

1. Create a test admin user (if not exists)
2. Load all real cost codes
3. Load all real labor rates
4. Load the Citizens Medical Center project

## Notes

- All seed files create a test admin user with ID `00000000-0000-0000-0000-000000000001`
- Seeds use `ON CONFLICT DO NOTHING` to prevent duplicate entries
- Seeds are idempotent - safe to run multiple times
- Real data extracted from `projections.xlsm` on 2026-02-16

## Data Source

All real data comes from the Citizens Medical Center project Excel file:

- File: `projections.xlsm`
- Sheets used:
  - CostCodes_Master (cost codes)
  - Labor_Rates (labor classifications and rates)
  - Projections (project details)

## Future Seeds

Additional seed files can be added for:

- Employee roster (from Employee_Roster sheet)
- Budget baseline (from Budget_Baseline sheet)
- Actual costs (from Actuals_Normalized sheet)
- Time entries (from daily time tracking)

Follow the naming convention: `00X_description.sql` where X is the sequence number.
