# 05 - Equipment Catalog

## Overview

Reference data screen for managing rental equipment from vendors (Sunbelt, United, etc.). Contains daily, weekly, and monthly rates used for estimating equipment costs in budgets.

## Screen

- `/setup/equipment` — EquipmentCatalogPage

## User Stories

### US-05.1: View Equipment Catalog

**As a** user,
**I want to** view all equipment with rental rates,
**So that** I can reference costs when budgeting equipment.

**Acceptance Criteria:**

- [ ] Table with columns: Vendor, Description, Category, Daily Rate, Weekly Rate, Monthly Rate
- [ ] Sortable by any column
- [ ] Default sort: by Category, then Description
- [ ] Rates formatted as currency
- [ ] Pagination: 25 items per page
- [ ] Shows total count

### US-05.2: Filter Equipment

**As a** user,
**I want to** filter equipment by category or vendor,
**So that** I can find specific types of equipment.

**Acceptance Criteria:**

- [ ] Category filter dropdown (e.g., Aerial, Earthmoving, Material Handling, Power, General)
- [ ] Vendor filter dropdown (e.g., Sunbelt, United, All)
- [ ] Search input for description
- [ ] All filters work in combination
- [ ] Debounced search (300ms)

### US-05.3: Add Equipment

**As an** Admin,
**I want to** add equipment to the catalog,
**So that** new rental items are available for reference.

**Acceptance Criteria:**

- [ ] "+ Add Equipment" button (Admin only)
- [ ] Modal with fields:
  - Vendor (required, max 100 chars)
  - Description (required, max 255 chars)
  - Category (required, dropdown)
  - Daily Rate (required, positive number)
  - Weekly Rate (required, positive number)
  - Monthly Rate (required, positive number)
- [ ] Validation: weekly rate should be < 7 × daily rate (warning, not blocking)
- [ ] On success: close modal, toast, table refreshes

### US-05.4: Edit Equipment

**As an** Admin,
**I want to** edit equipment rates,
**So that** I can keep rates current.

**Acceptance Criteria:**

- [ ] Edit icon on each row (Admin only)
- [ ] Modal pre-filled with current values
- [ ] All fields editable
- [ ] On success: close modal, toast, table refreshes

### US-05.5: Delete Equipment

**As an** Admin,
**I want to** remove equipment from the catalog,
**So that** outdated items don't clutter the list.

**Acceptance Criteria:**

- [ ] Delete icon on each row (Admin only)
- [ ] Confirmation dialog: "Delete {description} from {vendor}?"
- [ ] Hard delete (reference data, not linked to other tables in MVP)
- [ ] On success: toast, table refreshes

## UI/UX Requirements

- Table layout similar to other setup screens
- Currency columns right-aligned
- Category shown as colored badge
- Admin actions hidden for non-Admin roles
- Desktop-optimized layout (1920×1080)

## Business Rules

| Rule                     | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| Reference Only           | Equipment catalog is for reference/estimation, not linked to budget lines in MVP |
| Rate Hierarchy           | Typically: monthly < 4 × weekly < 30 × daily (warn if not)                       |
| No Uniqueness Constraint | Same equipment can appear from different vendors                                 |
| Categories               | Aerial, Earthmoving, Material Handling, Power, General (extensible)              |

## API Endpoints

| Action           | Method | Endpoint                                                |
| ---------------- | ------ | ------------------------------------------------------- |
| List equipment   | GET    | `/api/equipment-catalog?category={cat}&vendor={vendor}` |
| Create equipment | POST   | `/api/equipment-catalog`                                |
| Update equipment | PUT    | `/api/equipment-catalog/{id}`                           |
| Delete equipment | DELETE | `/api/equipment-catalog/{id}`                           |

## Permissions

| Action           | Admin | PM  | Viewer |
| ---------------- | ----- | --- | ------ |
| View catalog     | ✅    | ✅  | ✅     |
| Add equipment    | ✅    | ❌  | ❌     |
| Edit equipment   | ✅    | ❌  | ❌     |
| Delete equipment | ✅    | ❌  | ❌     |

## Dependencies

- Spec 01 (Authentication)
- Backend: Equipment Catalog API
- Database: EQUIPMENT_CATALOG table (data from `2025 Equipment Rental Costs.xlsx`)

## Edge Cases

- Importing from Excel → future feature, MVP is manual entry + seed data
- Rate of 0 → allowed but show warning
- Very long description → truncate in table, tooltip on hover
