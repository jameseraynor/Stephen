# 11 - Monthly Actuals

## Overview

Record actual costs incurred by month and cost code. Labor actuals can be synced from daily time entries. Non-labor actuals (materials, equipment, subs) are entered manually. Shows REG/OT/DT breakdown for labor.

## Screen

- `/projects/:id/actuals` — MonthlyActualsPage

## User Stories

### US-11.1: View Monthly Actuals

**As a** user,
**I want to** see actual costs by month and cost code,
**So that** I can track what has been spent.

**Acceptance Criteria:**

- [ ] Month selector at the top (dropdown or navigation arrows)
- [ ] Default to current month
- [ ] Table with columns: Cost Code, Description, Type, REG Hours, OT Hours, DT Hours, Total Hours, Labor Cost, Other Cost, Total Cost
- [ ] Hours columns only for Labor (type L) lines
- [ ] Footer row with monthly totals
- [ ] JTD (Job-to-Date) summary section:
  - Total JTD Cost
  - JTD by cost type (L/M/E/S/F/O)
  - JTD Hours (ST/OT/DT breakdown)
- [ ] Sortable by any column

### US-11.2: Sync Labor Actuals from Time Entries

**As a** PM,
**I want to** sync labor actuals from daily time entries,
**So that** I don't have to re-enter labor data.

**Acceptance Criteria:**

- [ ] "Sync from Time Entries" button (Admin/PM only)
- [ ] Aggregates DAILY_TIME_ENTRIES for the selected month and project:
  - Groups by cost_code_id
  - Sums hours_st, hours_ot, hours_dt
  - Calculates labor cost: `(ST × rate) + (OT × rate × 1.5) + (DT × rate × 2.0)`
  - Rate = employee's burdened rate at time of entry
- [ ] Preview dialog showing what will be synced:
  - Table of cost codes with calculated hours and costs
  - "This will update labor actuals for {month}. Existing labor actuals will be overwritten."
- [ ] On confirm: creates/updates ACTUALS records for labor cost codes
- [ ] On success: toast "Labor actuals synced for {month}", table refreshes
- [ ] If no time entries exist for the month: show "No time entries found for {month}"

### US-11.3: Manual Entry for Non-Labor Actuals

**As a** PM,
**I want to** manually enter actuals for materials, equipment, and subs,
**So that** all costs are tracked.

**Acceptance Criteria:**

- [ ] "+ Add Actual" button (Admin/PM only)
- [ ] Modal with fields:
  - Cost Code (required, searchable dropdown of active cost codes)
  - Month (pre-filled with selected month, editable)
  - For Labor type:
    - REG Hours, OT Hours, DT Hours
    - Labor Cost (auto-calculated or manual override)
  - For Non-Labor type:
    - Actual Amount (required, >= 0)
    - Actual Quantity (optional)
    - Actual Unit Cost (optional)
  - Notes (optional)
  - Source: "MANUAL" (auto-set)
- [ ] If an actual already exists for this cost code + month: update (upsert)
- [ ] On success: close modal, toast, table refreshes

### US-11.4: Edit Actual

**As an** Admin or PM,
**I want to** edit an actual entry,
**So that** I can correct errors.

**Acceptance Criteria:**

- [ ] Edit icon on each row (Admin/PM only)
- [ ] Modal pre-filled with current values
- [ ] All fields editable except cost code and month
- [ ] On success: close modal, toast, table refreshes

### US-11.5: View JTD Summary

**As a** user,
**I want to** see job-to-date totals,
**So that** I can compare against the budget.

**Acceptance Criteria:**

- [ ] JTD section (always visible, not filtered by month):
  - Total JTD Cost
  - JTD by cost type with budget comparison:
    | Type | Budget | JTD Actual | Variance | % Complete |
  - JTD Hours: Total ST, OT, DT
- [ ] Variance = Budget - JTD Actual (positive = under budget, negative = over)
- [ ] % Complete = JTD / Budget × 100
- [ ] Color coding: green if under budget, red if over budget

### US-11.6: Navigate Between Months

**As a** user,
**I want to** navigate between months,
**So that** I can review historical actuals.

**Acceptance Criteria:**

- [ ] Month navigation: previous/next arrows + dropdown
- [ ] Range: project start date to current month
- [ ] Future months not selectable
- [ ] Each month loads its own actuals data

## UI/UX Requirements

- Split layout: month actuals table (top) + JTD summary (bottom)
- Month selector is prominent
- "Sync from Time Entries" button is visually distinct (secondary action)
- Hours columns right-aligned with 1 decimal
- Currency columns right-aligned
- Type column shows colored badge
- Over-budget rows highlighted in light red
- Loading skeleton while fetching
- Read-only mode when project is not ACTIVE (except COMPLETED allows final adjustments)
- Empty state per month: "No actuals for {month}. Sync from time entries or add manually."

## Business Rules

| Rule             | Description                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Sync Logic       | Aggregates DAILY_TIME_ENTRIES by month + cost_code, calculates cost using burdened rates |
| Sync Overwrites  | Syncing replaces existing labor actuals for that month (not additive)                    |
| Manual Entry     | Non-labor actuals are always manual                                                      |
| Upsert           | One actual record per project + cost_code + month                                        |
| Cost Calculation | Labor: `(ST × rate) + (OT × rate × 1.5) + (DT × rate × 2.0)`                             |
| JTD              | Sum of all actuals from project start to current month                                   |
| Variance         | Budget - JTD Actual (positive = under budget)                                            |
| % Complete       | JTD Actual / Budget × 100                                                                |
| Project State    | ACTIVE: full access. COMPLETED: final adjustments allowed. ON_HOLD/CANCELLED: read-only  |

## API Endpoints

| Action                 | Method | Endpoint                                                 |
| ---------------------- | ------ | -------------------------------------------------------- |
| Get monthly actuals    | GET    | `/api/projects/{projectId}/actuals?month={YYYY-MM}`      |
| Get all actuals (JTD)  | GET    | `/api/projects/{projectId}/actuals`                      |
| Create/update actual   | POST   | `/api/projects/{projectId}/actuals`                      |
| Sync from time entries | POST   | `/api/projects/{projectId}/actuals/sync?month={YYYY-MM}` |
| Get budget lines       | GET    | `/api/projects/{projectId}/budget`                       |

## Permissions

| Action                 | Admin | PM            | Viewer        |
| ---------------------- | ----- | ------------- | ------------- |
| View actuals           | ✅    | ✅ (assigned) | ✅ (assigned) |
| Sync from time entries | ✅    | ✅ (assigned) | ❌            |
| Add/edit actuals       | ✅    | ✅ (assigned) | ❌            |

## Dependencies

- Spec 01 (Authentication)
- Spec 02 (Project Selection) — project context
- Spec 03 (Cost Codes) — cost code reference
- Spec 08 (Budget) — budget data for variance calculation
- Spec 10 (Time Entry) — source data for labor sync
- Backend: Actuals API, Budget API, Time Entries aggregation

## Edge Cases

- Syncing when no time entries exist → show message, no changes
- Syncing overwrites manually adjusted labor actuals → warn in confirmation dialog
- Month with only labor actuals → non-labor columns show $0
- Month with only non-labor actuals → hours columns show 0
- Budget line doesn't exist for a cost code with actuals → show actual without budget comparison
- Actual exceeds budget for a cost code → highlight row in red
- Employee rate changed mid-month → sync uses rate at time of each entry
