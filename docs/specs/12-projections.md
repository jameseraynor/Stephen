# 12 - Projections

## Overview

Create labor forecasts by month with crew size planning. Projections are saved as snapshots for historical comparison. Shows actual vs projected timeline and calculates forecast-at-completion GP.

## Screen

- `/projects/:id/projections` — ProjectionsPage

## User Stories

### US-12.1: View Projection Snapshots

**As a** user,
**I want to** see a list of all projection snapshots,
**So that** I can review forecast history.

**Acceptance Criteria:**

- [ ] Snapshot list (cards or table) showing:
  - Snapshot Name (e.g., "January 2025 Projection")
  - Snapshot Date
  - Projected GP$ and GP%
  - Created By (user name)
  - Notes (truncated)
- [ ] Sorted by date descending (most recent first)
- [ ] Latest snapshot marked with "Current" badge
- [ ] Click to view snapshot details

### US-12.2: Create New Projection

**As an** Admin or PM,
**I want to** create a new projection snapshot,
**So that** I can forecast remaining costs.

**Acceptance Criteria:**

- [ ] "+ New Projection" button (Admin/PM only)
- [ ] Step 1: Snapshot metadata
  - Name (required, e.g., "February 2025 Remaining Labor Est")
  - Notes (optional)
- [ ] Step 2: Monthly crew planning grid
  - Rows: one per labor cost code (from budget)
  - Columns: remaining months (current month to project end date)
  - Per cell: Crew Size, Hours/Person/Week, Weeks in Month
  - Auto-calculated: `Projected Hours = Crew Size × Hours/Week × Weeks`
  - Auto-calculated: `Projected Cost = Projected Hours × Burdened Rate`
- [ ] Step 3: Review summary
  - Total Projected Hours (remaining)
  - Total Projected Cost (remaining)
  - JTD Actual Cost (from actuals)
  - Forecast at Completion = JTD + Remaining Projected
  - Projected GP$ = Contract - Forecast at Completion
  - Projected GP% = GP$ / Contract × 100
  - Variance from Budget GP%
- [ ] On save: creates snapshot + detail records
- [ ] On success: redirect to snapshot detail view

### US-12.3: View Projection Detail

**As a** user,
**I want to** view a projection snapshot's details,
**So that** I can see the monthly breakdown.

**Acceptance Criteria:**

- [ ] Header: snapshot name, date, created by, GP metrics
- [ ] Monthly breakdown table:
  - Rows: cost codes
  - Columns: months (from projection start to project end)
  - Values: projected hours and cost per cell
  - Row totals and column totals
- [ ] Summary section:
  - Budget vs JTD Actual vs Projected Remaining vs Forecast at Completion
  - Per cost type breakdown
  - GP comparison (budgeted vs projected)

### US-12.4: Compare Projections

**As a** PM,
**I want to** compare two projection snapshots,
**So that** I can see how the forecast has changed over time.

**Acceptance Criteria:**

- [ ] "Compare" button that opens comparison view
- [ ] Select two snapshots from dropdown
- [ ] Side-by-side or diff view showing:
  - Projected GP% for each snapshot
  - Delta in projected hours and cost
  - Month-by-month differences
- [ ] Color coding: improvements in green, deterioration in red

### US-12.5: Edit Projection

**As an** Admin or PM (owner),
**I want to** edit a projection I created,
**So that** I can update the forecast.

**Acceptance Criteria:**

- [ ] Edit button on snapshot (visible to creator or Admin)
- [ ] Opens the crew planning grid with current values
- [ ] Can modify crew sizes, hours, weeks
- [ ] Recalculates all derived values
- [ ] On save: updates existing snapshot

### US-12.6: Delete Projection

**As an** Admin or PM (owner),
**I want to** delete a projection snapshot,
**So that** I can remove incorrect forecasts.

**Acceptance Criteria:**

- [ ] Delete button on snapshot (visible to creator or Admin)
- [ ] Confirmation dialog: "Delete projection '{name}'? This cannot be undone."
- [ ] Cannot delete if it's the only snapshot (warn: "This is the only projection")
- [ ] On success: toast, redirect to snapshot list

### US-12.7: Actual vs Projected Timeline

**As a** PM,
**I want to** see a timeline of actual vs projected costs,
**So that** I can visualize the project's financial trajectory.

**Acceptance Criteria:**

- [ ] Line chart showing:
  - X-axis: months (project start to end)
  - Y-axis: cumulative cost
  - Line 1: Budget (planned cumulative spend)
  - Line 2: Actual (JTD cumulative spend)
  - Line 3: Projected (remaining forecast, continuing from actuals)
- [ ] Vertical line marking "today"
- [ ] Tooltip on hover showing values for each line at that month

## UI/UX Requirements

- Two-panel layout: snapshot list (left/top) + detail view (right/bottom)
- Crew planning grid is spreadsheet-like (similar to time entry)
- Keyboard navigation in grid (Tab, Enter)
- Auto-calculated fields are read-only with distinct styling
- Chart uses consistent colors (blue=budget, green=actual, orange=projected)
- Loading skeleton while fetching
- Read-only mode when project is CANCELLED
- ON_HOLD and COMPLETED projects CAN create projections (per state machine)

## Business Rules

| Rule                   | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| Projected Hours        | `Crew Size × Hours/Person/Week × Weeks in Month`                               |
| Projected Cost         | `Projected Hours × Burdened Rate`                                              |
| Forecast at Completion | `JTD Actual Cost + Remaining Projected Cost`                                   |
| Projected GP$          | `Contract Amount - Forecast at Completion`                                     |
| Projected GP%          | `Projected GP$ / Contract Amount × 100`                                        |
| Crew Size Estimation   | `Remaining Hours / (Hours/Week × Remaining Weeks)` — helper for initial values |
| Snapshot Immutability  | Once created, a snapshot captures a point-in-time forecast                     |
| Edit Permission        | Creator can edit their own projections. Admin can edit any.                    |
| Delete Permission      | Creator can delete their own. Admin can delete any.                            |
| Allowed States         | Can create projections in ACTIVE, ON_HOLD, and COMPLETED states                |
| Default Values         | Weeks in month defaults to ~4.33 (varies by month). Hours/week defaults to 40. |

## API Endpoints

| Action              | Method | Endpoint                                             |
| ------------------- | ------ | ---------------------------------------------------- |
| List snapshots      | GET    | `/api/projects/{projectId}/projections`              |
| Create snapshot     | POST   | `/api/projects/{projectId}/projections`              |
| Get snapshot detail | GET    | `/api/projects/{projectId}/projections/{snapshotId}` |
| Update snapshot     | PUT    | `/api/projects/{projectId}/projections/{snapshotId}` |
| Delete snapshot     | DELETE | `/api/projects/{projectId}/projections/{snapshotId}` |
| Get actuals (JTD)   | GET    | `/api/projects/{projectId}/actuals`                  |
| Get budget          | GET    | `/api/projects/{projectId}/budget`                   |

## Permissions

| Action            | Admin    | PM            | Viewer        |
| ----------------- | -------- | ------------- | ------------- |
| View projections  | ✅       | ✅ (assigned) | ✅ (assigned) |
| Create projection | ✅       | ✅ (assigned) | ❌            |
| Edit projection   | ✅ (any) | ✅ (own only) | ❌            |
| Delete projection | ✅ (any) | ✅ (own only) | ❌            |

## Dependencies

- Spec 01 (Authentication)
- Spec 02 (Project Selection) — project context
- Spec 03 (Cost Codes) — labor cost codes
- Spec 04 (Labor Rates) — burdened rates for cost calculation
- Spec 08 (Budget) — budget data for comparison
- Spec 11 (Actuals) — JTD data for forecast calculation
- Backend: Projections API, Actuals API, Budget API

## Edge Cases

- No budget lines → cannot create projection (show "Create a budget first")
- No actuals yet → JTD = $0, forecast = full projected amount
- Project end date in the past → show warning, allow projection for reconciliation
- Crew size of 0 for a month → projected hours = 0 for that month (valid: no work planned)
- Very long projection (24+ months) → grid should handle with horizontal scroll
- Comparing snapshots with different cost codes → show all codes, missing values as $0
- Deleting the "current" snapshot → next most recent becomes current
