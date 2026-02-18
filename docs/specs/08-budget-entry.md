# 08 - Budget Entry

## Overview

Enter and manage the project budget by cost code. Each budget line maps a cost code to budgeted hours (labor) and dollars. Includes running totals, GP% calculation, and variance warnings.

## Screen

- `/projects/:id/budget` — BudgetEntryPage

## User Stories

### US-08.1: View Budget Lines

**As a** user,
**I want to** see all budget lines for the project,
**So that** I can review the planned costs.

**Acceptance Criteria:**

- [ ] Table with columns: Cost Code, Description, Type, Budgeted Hours, Unit Cost ($/hr), Budgeted Amount, Notes
- [ ] Hours and Unit Cost columns only shown for Labor (type L) lines
- [ ] Sortable by any column
- [ ] Default sort: by Cost Code ascending
- [ ] Footer row with totals: Total Hours (labor only), Total Amount
- [ ] Summary bar above table showing:
  - Total Budget: $X
  - Contract Amount: $Y
  - Budgeted GP: $Z (Contract - Budget)
  - Budgeted GP%: N%
- [ ] GP% color: green if >= project target, yellow if within 5%, red if > 5% below

### US-08.2: Filter Budget Lines

**As a** user,
**I want to** filter budget lines by cost type,
**So that** I can focus on labor or material costs.

**Acceptance Criteria:**

- [ ] Filter tabs: All | L | M | E | S | F | O
- [ ] Totals update to reflect filtered view
- [ ] Search input to find by cost code or description
- [ ] Filters and search work in combination

### US-08.3: Add Budget Line

**As an** Admin or PM,
**I want to** add a new budget line,
**So that** I can plan costs for a cost code.

**Acceptance Criteria:**

- [ ] "+ Add Line" button (Admin/PM only, hidden for Viewer)
- [ ] Modal with fields:
  - Cost Code (required, searchable dropdown of active cost codes)
  - Description auto-populated from cost code (editable for override)
  - Type auto-populated from cost code (read-only)
  - If Labor type:
    - Budgeted Hours (required, >= 0)
    - Unit Cost $/hr (required, >= 0, default from project's labor rate)
    - Budgeted Amount (auto-calculated: hours × unit cost, editable for override)
  - If Non-Labor type:
    - Budgeted Amount (required, >= 0)
    - Budgeted Quantity (optional)
    - Budgeted Unit Cost (optional)
  - Notes (optional, text area)
- [ ] Cost code dropdown excludes codes already in the budget (unique per project)
- [ ] On success: close modal, toast, table refreshes, totals recalculate

### US-08.4: Edit Budget Line

**As an** Admin or PM,
**I want to** edit a budget line,
**So that** I can revise the budget as estimates change.

**Acceptance Criteria:**

- [ ] Edit icon on each row (Admin/PM only)
- [ ] Modal pre-filled with current values
- [ ] Cost Code is read-only (cannot change the code, only amounts)
- [ ] Same validation as add
- [ ] On success: close modal, toast, table refreshes, totals recalculate

### US-08.5: Delete Budget Line

**As an** Admin or PM,
**I want to** delete a budget line,
**So that** I can remove incorrect entries.

**Acceptance Criteria:**

- [ ] Delete icon on each row (Admin/PM only)
- [ ] Confirmation dialog: "Delete budget line for {cost code}? This cannot be undone."
- [ ] If actuals exist for this cost code, show warning: "Actuals exist for this cost code. Deleting the budget line will not delete actuals."
- [ ] On success: toast, table refreshes, totals recalculate

### US-08.6: Labor Variance Warning

**As a** PM,
**I want to** be warned when my labor budget amount doesn't match hours × rate,
**So that** I can catch data entry errors.

**Acceptance Criteria:**

- [ ] For Labor lines: if `|budgeted_amount - (hours × unit_cost)| / budgeted_amount > 0.10`, show warning
- [ ] Warning is non-blocking (soft validation)
- [ ] Warning text: "Budget amount differs from hours × rate by more than 10%"
- [ ] User can acknowledge and proceed

### US-08.7: Over-Budget Alert

**As a** PM,
**I want to** be alerted when total budget exceeds contract amount,
**So that** I know the project is planned at a loss.

**Acceptance Criteria:**

- [ ] If Total Budget > Contract Amount, show red alert banner:
      "Total budget ($X) exceeds contract amount ($Y). Projected GP is negative."
- [ ] If Budgeted GP% differs from project target by > 5 points, show yellow info:
      "Budgeted GP% (X%) differs from target (Y%) by more than 5 points."
- [ ] Alerts update in real-time as lines are added/edited/deleted

## UI/UX Requirements

- Full-width table with sticky header
- Summary bar is always visible (sticky or at top)
- Inline editing option for quick changes (future: MVP uses modal)
- Currency fields right-aligned
- Hours fields right-aligned with 1 decimal
- Type column shows colored badge
- Empty state: "No budget lines yet. Click '+ Add Line' to start."
- Read-only mode when project is not ACTIVE (hide add/edit/delete buttons, show banner)

## Business Rules

| Rule                   | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| Unique Cost Code       | One budget line per cost code per project                             |
| Labor Fields           | Hours and Unit Cost only for type L                                   |
| Amount Calculation     | Labor: hours × unit_cost (editable override). Non-labor: direct entry |
| 10% Variance Warning   | Soft warning if labor amount differs > 10% from hours × rate          |
| Over-Budget Alert      | Soft alert if total budget > contract amount                          |
| GP Drift Alert         | Info if budgeted GP% differs > 5 points from project target           |
| Project Must Be ACTIVE | Cannot add/edit/delete if project is ON_HOLD, COMPLETED, or CANCELLED |
| Amount >= 0            | No negative budget amounts                                            |
| Hours >= 0             | No negative hours                                                     |

## API Endpoints

| Action             | Method | Endpoint                                    |
| ------------------ | ------ | ------------------------------------------- |
| List budget lines  | GET    | `/api/projects/{projectId}/budget`          |
| Create budget line | POST   | `/api/projects/{projectId}/budget`          |
| Update budget line | PUT    | `/api/projects/{projectId}/budget/{lineId}` |
| Delete budget line | DELETE | `/api/projects/{projectId}/budget/{lineId}` |
| Get cost codes     | GET    | `/api/cost-codes?type={type}`               |

## Permissions

| Action             | Admin | PM            | Viewer        |
| ------------------ | ----- | ------------- | ------------- |
| View budget        | ✅    | ✅ (assigned) | ✅ (assigned) |
| Add budget line    | ✅    | ✅ (assigned) | ❌            |
| Edit budget line   | ✅    | ✅ (assigned) | ❌            |
| Delete budget line | ✅    | ✅ (assigned) | ❌            |

## Dependencies

- Spec 01 (Authentication)
- Spec 02 (Project Selection) — project context
- Spec 03 (Cost Codes) — cost code dropdown data
- Spec 04 (Labor Rates) — default unit cost for labor lines
- Backend: Budget API, Cost Codes API

## Edge Cases

- Adding a line for a cost code that already has actuals → allowed, budget is independent
- Deleting all budget lines → totals show $0, GP% shows 100% (no costs)
- Very large budget (>$100M) → ensure currency formatting handles large numbers
- Editing while another user edits → last write wins (MVP, no optimistic locking)
- Cost code deactivated after budget line created → line remains, code shown as "(inactive)"
