# 10 - Daily Time Entry

## Overview

Daily time tracking for crew members by cost code. Uses a weekly grid view (employees × days) for efficient bulk entry. Supports ST/OT/DT hours with auto-calculation of overtime.

## Screen

- `/projects/:id/time-entry` — DailyTimeEntryPage

## User Stories

### US-10.1: View Weekly Time Grid

**As a** PM,
**I want to** see a weekly grid of time entries,
**So that** I can review and enter hours for the crew.

**Acceptance Criteria:**

- [ ] Week selector at the top (previous/next arrows + date range display)
- [ ] Default to current week (Monday–Sunday)
- [ ] Grid layout:
  - Rows: one per active employee (grouped by cost code if multiple)
  - Columns: Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total
  - Cells: hours input (numeric, 0-24, 1 decimal)
- [ ] Row header shows: Employee Name, Cost Code, Classification
- [ ] Column footer shows daily totals
- [ ] Grand total in bottom-right corner
- [ ] Color coding: cells with OT hours highlighted in yellow, DT in orange

### US-10.2: Enter Time

**As a** PM,
**I want to** enter daily hours for employees,
**So that** labor costs are tracked.

**Acceptance Criteria:**

- [ ] Click a cell to enter hours (inline editing)
- [ ] Tab key moves to next cell (left to right, then next row)
- [ ] Enter key moves to cell below
- [ ] Default entry is ST (straight time) hours
- [ ] If daily total > 8 hours for an employee, excess auto-classified as OT
- [ ] If weekly total > 40 hours for an employee, excess auto-classified as OT
- [ ] PM can manually override ST/OT/DT split (expand cell to show ST/OT/DT fields)
- [ ] Auto-save on cell blur (or debounced 1 second after last keystroke)
- [ ] Visual indicator for unsaved changes (cell border color)
- [ ] Source field set to "MANUAL" for all entries

### US-10.3: Select Cost Code for Time Entry

**As a** PM,
**I want to** assign time entries to specific cost codes,
**So that** hours are categorized correctly.

**Acceptance Criteria:**

- [ ] Cost code selector per employee row (dropdown of active Labor cost codes)
- [ ] An employee can have multiple rows (one per cost code)
- [ ] "+ Add Row" button to add another cost code for an employee
- [ ] Default cost code can be set per employee (most common assignment)

### US-10.4: Copy from Previous Week

**As a** PM,
**I want to** copy time entries from the previous week,
**So that** I don't have to re-enter the same crew schedule.

**Acceptance Criteria:**

- [ ] "Copy Previous Week" button
- [ ] Copies employee + cost code + hours structure from previous week
- [ ] Does NOT overwrite existing entries for the target week
- [ ] Confirmation dialog: "Copy time entries from {prev week dates}? Existing entries will not be overwritten."
- [ ] On success: grid refreshes with copied data

### US-10.5: View Running Totals and Estimated Cost

**As a** PM,
**I want to** see running totals and estimated labor cost,
**So that** I can monitor spending in real-time.

**Acceptance Criteria:**

- [ ] Summary section showing:
  - Total ST Hours this week
  - Total OT Hours this week
  - Total DT Hours this week
  - Estimated Cost: `(ST × rate) + (OT × rate × 1.5) + (DT × rate × 2.0)` per employee, summed
- [ ] Cost uses each employee's burdened rate from their classification
- [ ] Summary updates in real-time as hours are entered

### US-10.6: View Time Entry History

**As a** user,
**I want to** navigate to past weeks,
**So that** I can review or correct historical time entries.

**Acceptance Criteria:**

- [ ] Week navigation arrows (previous/next)
- [ ] Date picker to jump to a specific week
- [ ] Past weeks are editable (Admin/PM only)
- [ ] Future weeks can have entries (for planning)

## UI/UX Requirements

- Grid is the primary interface (spreadsheet-like feel)
- Compact cells for data density
- Keyboard navigation (Tab, Enter, Arrow keys)
- Auto-save with visual feedback (green checkmark on save, red on error)
- Sticky employee column (first column stays visible on horizontal scroll)
- Sticky header row
- Week navigation is prominent and easy to use
- Loading skeleton for grid while fetching
- Read-only mode when project is not ACTIVE (cells disabled, no add/edit)
- Empty state: "No employees assigned to this project. Add employees in the Roster tab."

## Business Rules

| Rule                   | Description                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| OT Auto-Calc (Daily)   | Hours > 8 in a day → excess is OT                                                           |
| OT Auto-Calc (Weekly)  | Hours > 40 in a week → excess is OT (applied after daily OT)                                |
| DT                     | Double time is always manually entered (no auto-calc)                                       |
| Max Hours              | Total ST + OT + DT ≤ 24 per employee per day                                                |
| Cost Calculation       | ST: hours × burdened_rate. OT: hours × burdened_rate × 1.5. DT: hours × burdened_rate × 2.0 |
| Burden                 | Burdened rate = base_rate × (1 + burden_pct / 100)                                          |
| Source                 | All manual entries have source = "MANUAL"                                                   |
| Active Employees Only  | Only active employees appear in the grid                                                    |
| Labor Cost Codes Only  | Only cost codes with type "L" (Labor) available                                             |
| Project Must Be ACTIVE | Cannot enter time if project is not ACTIVE                                                  |
| Unique Entry           | One entry per employee + cost code + date (upsert behavior)                                 |

## API Endpoints

| Action            | Method | Endpoint                                                                 |
| ----------------- | ------ | ------------------------------------------------------------------------ |
| List time entries | GET    | `/api/projects/{projectId}/time-entries?startDate={date}&endDate={date}` |
| Create time entry | POST   | `/api/projects/{projectId}/time-entries`                                 |
| Update time entry | PUT    | `/api/time-entries/{id}`                                                 |
| Delete time entry | DELETE | `/api/time-entries/{id}`                                                 |
| List employees    | GET    | `/api/projects/{projectId}/employees?isActive=true`                      |
| List cost codes   | GET    | `/api/cost-codes?type=LABOR`                                             |

## Permissions

| Action            | Admin | PM            | Viewer        |
| ----------------- | ----- | ------------- | ------------- |
| View time entries | ✅    | ✅ (assigned) | ✅ (assigned) |
| Enter/edit time   | ✅    | ✅ (assigned) | ❌            |
| Delete time entry | ✅    | ✅ (assigned) | ❌            |

## Dependencies

- Spec 01 (Authentication)
- Spec 02 (Project Selection) — project context
- Spec 03 (Cost Codes) — labor cost codes for dropdown
- Spec 04 (Labor Rates) — burdened rates for cost calculation
- Spec 09 (Employee Roster) — active employees for grid rows
- Backend: Time Entries API, Employees API, Cost Codes API

## Edge Cases

- Employee added mid-week → appears in grid for remaining days
- Employee deactivated mid-week → existing entries preserved, no new entries
- Entering 0 hours → treated as no entry (don't create record)
- Entering hours for a holiday → allowed (no holiday calendar in MVP)
- Two PMs editing same employee's time simultaneously → last write wins
- Copy previous week when previous week is empty → show "No entries to copy"
- Very large crew (50+ employees) → grid should handle with virtual scrolling or pagination
