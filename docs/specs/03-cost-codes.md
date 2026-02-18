# 03 - Cost Codes Management

## Overview

Reference data screen for managing ~370 standardized cost codes used across all projects. Cost codes categorize expenses by type (Labor, Material, Equipment, Subcontractor, Other, Project Management).

## Screen

- `/setup/cost-codes` — CostCodesPage

## User Stories

### US-03.1: View Cost Codes

**As a** user,
**I want to** view all cost codes in a searchable table,
**So that** I can find the right code for budget/actuals entry.

**Acceptance Criteria:**

- [ ] Table with columns: Code, Description, Type, Status (Active/Inactive)
- [ ] Sortable by any column (click header to toggle asc/desc)
- [ ] Default sort: by Code ascending
- [ ] Pagination: 50 items per page with page navigation
- [ ] Shows total count: "Showing X of Y cost codes"
- [ ] Loading skeleton while fetching

### US-03.2: Filter Cost Codes by Type

**As a** user,
**I want to** filter cost codes by type,
**So that** I can see only labor or material codes.

**Acceptance Criteria:**

- [ ] Filter tabs/buttons: All | L (Labor) | M (Material) | E (Equipment) | S (Subcontractor) | F (PM/Field) | O (Other)
- [ ] "All" selected by default
- [ ] Selecting a type filters the table immediately
- [ ] Count updates per filter
- [ ] Filter works in combination with search

### US-03.3: Search Cost Codes

**As a** user,
**I want to** search cost codes by code or description,
**So that** I can quickly find a specific code.

**Acceptance Criteria:**

- [ ] Search input above the table
- [ ] Filters as user types (debounced 300ms)
- [ ] Searches against code and description fields
- [ ] Case-insensitive
- [ ] Works in combination with type filter

### US-03.4: Add Cost Code

**As an** Admin,
**I want to** add a new cost code,
**So that** new cost categories can be tracked.

**Acceptance Criteria:**

- [ ] "+ Add Cost Code" button visible only to Admin
- [ ] Opens modal with fields:
  - Code (required, max 50 chars, unique)
  - Description (required, max 255 chars)
  - Type (required, dropdown: L/M/E/S/F/O)
- [ ] Validation: code must be unique
- [ ] On success: close modal, toast "Cost code created", table refreshes
- [ ] On duplicate code: show "Code already exists" error

### US-03.5: Edit Cost Code

**As an** Admin,
**I want to** edit an existing cost code,
**So that** I can correct descriptions or change types.

**Acceptance Criteria:**

- [ ] Edit icon/button on each row (Admin only)
- [ ] Opens modal pre-filled with current values
- [ ] Can edit: Description, Type
- [ ] Code is read-only after creation
- [ ] On success: close modal, toast "Cost code updated", table refreshes

### US-03.6: Toggle Cost Code Active/Inactive

**As an** Admin,
**I want to** deactivate a cost code,
**So that** it no longer appears in dropdowns but historical data is preserved.

**Acceptance Criteria:**

- [ ] Toggle switch or button on each row (Admin only)
- [ ] Confirmation dialog: "Deactivate cost code {code}? It will no longer appear in new entries."
- [ ] Inactive codes shown with muted/gray styling
- [ ] Inactive codes do NOT appear in cost code dropdowns on other screens
- [ ] Inactive codes still appear in existing budget lines and actuals (historical data preserved)
- [ ] Can reactivate an inactive code

## UI/UX Requirements

- Full-width table layout
- Type column shows colored badge (L=blue, M=green, E=orange, S=purple, F=teal, O=gray)
- Compact row height for data density (~370 rows)
- Sticky header on scroll
- Admin actions (add/edit/toggle) hidden for PM and Viewer roles
- Desktop-optimized layout (1920×1080). Tablet/mobile support is post-MVP.

## Business Rules

| Rule                   | Description                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Code Uniqueness        | No two cost codes can have the same code value                                     |
| Code Immutable         | Code value cannot be changed after creation                                        |
| Soft Deactivation      | Deactivating hides from dropdowns, preserves historical data                       |
| Shared Across Projects | Cost codes are global, not per-project                                             |
| Type Values            | L (Labor), M (Material), E (Equipment), S (Subcontractor), F (PM/Field), O (Other) |

## API Endpoints

| Action           | Method | Endpoint                      |
| ---------------- | ------ | ----------------------------- |
| List cost codes  | GET    | `/api/cost-codes?type={type}` |
| Get cost code    | GET    | `/api/cost-codes/{id}`        |
| Create cost code | POST   | `/api/cost-codes`             |
| Update cost code | PUT    | `/api/cost-codes/{id}`        |
| Toggle active    | PATCH  | `/api/cost-codes/{id}`        |

## Permissions

| Action          | Admin | PM  | Viewer |
| --------------- | ----- | --- | ------ |
| View cost codes | ✅    | ✅  | ✅     |
| Add cost code   | ✅    | ❌  | ❌     |
| Edit cost code  | ✅    | ❌  | ❌     |
| Toggle active   | ✅    | ❌  | ❌     |

## Dependencies

- Spec 01 (Authentication) — user must be logged in
- Backend: Cost Codes API
- Database: COST_CODES table with seed data (~370 codes)

## Edge Cases

- Deactivating a code used in active budget lines → allowed, but warn Admin
- Searching with no results → show "No cost codes match your search"
- Very long description → truncate in table, full text on hover tooltip
- Bulk import of cost codes → future feature (MVP: manual entry + seed data)
