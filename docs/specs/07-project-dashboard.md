# 07 - Project Dashboard

## Overview

Central view of a project's financial health. Shows contract summary, GP metrics, cost breakdown by type, and hours summary. Entry point to all project modules via tab navigation.

## Screen

- `/projects/:id` — DashboardPage

## User Stories

### US-07.1: View Contract Summary

**As a** user viewing a project,
**I want to** see the contract summary at a glance,
**So that** I understand the project's financial scope.

**Acceptance Criteria:**

- [ ] Summary cards at the top showing:
  - Contract Amount (formatted currency)
  - Total Budgeted Cost (sum of all budget lines)
  - Budgeted GP$ (Contract - Total Budget)
  - Budgeted GP% (GP$ / Contract × 100)
- [ ] Each card has a label and large formatted value
- [ ] Cards layout optimized for desktop (1920×1080)

### US-07.2: View GP Metrics Comparison

**As a** PM or Admin,
**I want to** compare budgeted vs current vs projected GP,
**So that** I can assess if the project is on track financially.

**Acceptance Criteria:**

- [ ] Section showing three GP metrics side by side:
  - Budgeted GP% (from project setup)
  - Current GP% (based on JTD actuals + remaining budget)
  - Projected GP% (from latest projection snapshot)
- [ ] Color coding: green if >= budgeted, yellow if within 5%, red if > 5% below
- [ ] Variance shown: `Current GP% - Budgeted GP%` with +/- indicator
- [ ] If no projections exist, show "No projection yet" for projected GP

### US-07.3: View Cost Breakdown by Type

**As a** user,
**I want to** see costs broken down by type (L/M/E/S/F/O),
**So that** I can identify which categories are driving costs.

**Acceptance Criteria:**

- [ ] Horizontal bar chart or table showing per cost type:
  - Budget amount
  - JTD Actuals amount
  - Variance (Budget - Actuals)
  - % Complete (Actuals / Budget × 100)
- [ ] Cost types: Labor, Material, Equipment, Subcontractor, PM/Field, Other
- [ ] Color-coded bars (budget=blue, actuals=green, over-budget=red)
- [ ] Totals row at the bottom

### US-07.4: View Hours Summary

**As a** PM,
**I want to** see labor hours summary,
**So that** I can track labor progress.

**Acceptance Criteria:**

- [ ] Section showing:
  - Budgeted Hours (total from labor budget lines)
  - JTD Hours (total from actuals, broken down by ST/OT/DT)
  - Remaining Hours (Budgeted - JTD)
  - % Complete (JTD / Budgeted × 100)
- [ ] Progress bar showing % complete
- [ ] Warning if JTD hours > budgeted hours (over budget)

### US-07.5: Quick Navigation

**As a** user,
**I want to** quickly navigate to any project module,
**So that** I can access budget, time entry, actuals, etc.

**Acceptance Criteria:**

- [ ] Tab navigation bar: Dashboard | Budget | Employees | Time Entry | Actuals | Projections | Reports
- [ ] Current tab highlighted
- [ ] Setup menu accessible from header (Users, Cost Codes, Labor Rates, Equipment)
- [ ] Project name and job number shown in header/breadcrumb
- [ ] Project status badge visible in header

### US-07.6: Project Status Display

**As a** user,
**I want to** see the project status and allowed operations,
**So that** I know what I can do in the current state.

**Acceptance Criteria:**

- [ ] Status badge in header (ACTIVE/ON_HOLD/COMPLETED/CANCELLED)
- [ ] If project is not ACTIVE, show info banner:
  - ON_HOLD: "This project is on hold. Only projections can be created."
  - COMPLETED: "This project is completed. Only final adjustments and projections allowed."
  - CANCELLED: "This project is cancelled. All data is read-only."
- [ ] Write tabs (Budget, Time Entry, Actuals) show read-only indicator when project is not ACTIVE

## UI/UX Requirements

- Dashboard is the default landing page when selecting a project
- Cards use consistent sizing and spacing
- Charts use the project's color scheme
- All monetary values formatted as currency with thousands separators
- Percentages shown with 1 decimal place
- Loading skeletons for each section while data loads
- Desktop-optimized layout (1920×1080). Tablet/mobile support is post-MVP.
- Tab navigation is sticky at the top

## Business Rules

| Rule            | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| GP Calculation  | `GP$ = Contract Amount - Total Cost`                                               |
| GP% Calculation | `GP% = GP$ / Contract Amount × 100`                                                |
| Current GP%     | Based on: JTD Actuals + Remaining Budget (Budget - Actuals for each code)          |
| Projected GP%   | From latest projection snapshot (if exists)                                        |
| % Complete      | `JTD Actuals / Budget × 100` (capped at 100% for display)                          |
| Cost Types      | L (Labor), M (Material), E (Equipment), S (Subcontractor), F (PM/Field), O (Other) |
| Hours           | Only for Labor cost type                                                           |

## API Endpoints

| Action              | Method | Endpoint                     |
| ------------------- | ------ | ---------------------------- |
| Get project details | GET    | `/api/projects/{id}`         |
| Get project summary | GET    | `/api/projects/{id}/summary` |

The summary endpoint returns aggregated data: budget totals by type, actuals totals by type, hours summary, and latest projection.

## Permissions

| Action         | Admin | PM            | Viewer        |
| -------------- | ----- | ------------- | ------------- |
| View dashboard | ✅    | ✅ (assigned) | ✅ (assigned) |

## Dependencies

- Spec 01 (Authentication)
- Spec 02 (Project Selection) — project must be selected
- Spec 08 (Budget) — budget data for totals
- Spec 11 (Actuals) — actuals data for JTD
- Spec 12 (Projections) — latest projection for projected GP
- Backend: Project Summary API

## Edge Cases

- New project with no budget → show $0 for all budget fields, "No budget entered yet" message
- New project with no actuals → show $0 for JTD, 0% complete
- No projection snapshots → show "No projection created yet" instead of projected GP
- Budget exceeds contract → show negative GP in red
- JTD exceeds budget → show over-budget warning in red
- Project with only labor costs → non-labor sections show $0
