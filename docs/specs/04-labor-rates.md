# 04 - Labor Rates Management

## Overview

Reference data screen for managing labor rate classifications. Each classification has a base hourly rate and burden percentage, used to calculate burdened labor costs across all projects.

## Screen

- `/setup/labor-rates` — LaborRatesPage

## User Stories

### US-04.1: View Labor Rates

**As a** user,
**I want to** view all labor rate classifications,
**So that** I can see current rates and burden percentages.

**Acceptance Criteria:**

- [ ] Table with columns: Code, Description, Base Rate ($/hr), Burden %, Burdened Rate ($/hr), Status
- [ ] Burdened Rate is calculated: `Base Rate × (1 + Burden% / 100)`
- [ ] Rates formatted as currency with 2 decimals
- [ ] Burden % formatted with 1 decimal
- [ ] Sortable by any column
- [ ] Default sort: by Code ascending
- [ ] Shows total count

### US-04.2: Add Labor Rate

**As an** Admin,
**I want to** add a new labor rate classification,
**So that** new worker types can be assigned to projects.

**Acceptance Criteria:**

- [ ] "+ Add Rate" button visible only to Admin
- [ ] Modal with fields:
  - Code (required, max 50 chars, unique, e.g., "JM", "AP1", "FM")
  - Description (required, max 255 chars, e.g., "Journeyman", "Apprentice 1st Year")
  - Base Rate (required, positive number, $/hr)
  - Burden % (required, 0-100, e.g., 45.0)
- [ ] Burdened Rate auto-calculated and displayed as preview
- [ ] On success: close modal, toast, table refreshes

### US-04.3: Edit Labor Rate

**As an** Admin,
**I want to** edit a labor rate,
**So that** I can update rates when they change.

**Acceptance Criteria:**

- [ ] Edit icon on each row (Admin only)
- [ ] Modal pre-filled with current values
- [ ] Can edit: Description, Base Rate, Burden %
- [ ] Code is read-only after creation
- [ ] Burdened Rate recalculates in real-time as user edits
- [ ] On success: close modal, toast, table refreshes
- [ ] Warning: "Changing this rate affects future calculations for all projects using this classification"

### US-04.4: Toggle Labor Rate Active/Inactive

**As an** Admin,
**I want to** deactivate a labor rate,
**So that** it no longer appears in employee assignment dropdowns.

**Acceptance Criteria:**

- [ ] Toggle on each row (Admin only)
- [ ] Confirmation dialog with warning about existing employees
- [ ] Inactive rates hidden from dropdowns on Employee Roster
- [ ] Existing employees keep their assigned rate (historical data preserved)
- [ ] Can reactivate

## UI/UX Requirements

- Clean table layout, similar to Cost Codes page
- Burdened Rate column highlighted (calculated field)
- Currency columns right-aligned
- Admin actions hidden for non-Admin roles
- Desktop-optimized layout (1920×1080)

## Business Rules

| Rule                    | Description                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Code Uniqueness         | No two rates can share the same code                                                                |
| Code Immutable          | Code cannot be changed after creation                                                               |
| Burdened Rate           | `base_rate × (1 + burden_pct / 100)` — always calculated, never manually entered                    |
| Rate Changes            | Changing a rate affects future calculations only, not historical actuals                            |
| Shared Across Projects  | Labor rates are global reference data                                                               |
| Typical Classifications | Journeyman (JM), Foreman (FM), General Foreman (GF), Apprentice 0-3 (AP0-AP3), Project Manager (PM) |

## API Endpoints

| Action            | Method | Endpoint                |
| ----------------- | ------ | ----------------------- |
| List labor rates  | GET    | `/api/labor-rates`      |
| Create labor rate | POST   | `/api/labor-rates`      |
| Update labor rate | PUT    | `/api/labor-rates/{id}` |
| Toggle active     | PATCH  | `/api/labor-rates/{id}` |

## Permissions

| Action           | Admin | PM  | Viewer |
| ---------------- | ----- | --- | ------ |
| View labor rates | ✅    | ✅  | ✅     |
| Add labor rate   | ✅    | ❌  | ❌     |
| Edit labor rate  | ✅    | ❌  | ❌     |
| Toggle active    | ✅    | ❌  | ❌     |

## Dependencies

- Spec 01 (Authentication)
- Backend: Labor Rates API
- Database: LABOR_RATES table with seed data

## Edge Cases

- Editing a rate used by active employees → warn but allow (future calculations change)
- Deactivating a rate assigned to active employees → warn, existing assignments preserved
- Base rate of 0 → allowed (e.g., volunteer/intern), but show warning
- Burden % of 0 → allowed (no burden), burdened rate equals base rate
