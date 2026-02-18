# 02 - Project Selection

## Overview

Landing page after login. Displays all projects the user has access to as cards. Users select a project to enter the project context (Dashboard + tabs).

## Screen

- `/` — ProjectSelectionPage

## User Stories

### US-02.1: View Project List

**As an** authenticated user,
**I want to** see all projects I have access to,
**So that** I can select one to work on.

**Acceptance Criteria:**

- [ ] Display projects as cards in a grid layout (desktop optimized, 1920×1080)
- [ ] Each card shows: project name, job number, contract amount (formatted as currency), budgeted GP%, status badge
- [ ] Status badge colors: ACTIVE=green, ON_HOLD=yellow, COMPLETED=blue, CANCELLED=red
- [ ] Admin sees all projects
- [ ] PM sees only assigned projects
- [ ] Viewer sees only assigned projects
- [ ] Cards sorted by status (ACTIVE first), then by name alphabetically
- [ ] Empty state: "No projects found" with illustration

### US-02.2: Search Projects

**As a** user with many projects,
**I want to** search by name or job number,
**So that** I can quickly find a specific project.

**Acceptance Criteria:**

- [ ] Search input at the top of the page
- [ ] Filters cards in real-time as user types (debounced 300ms)
- [ ] Searches against project name and job number
- [ ] Case-insensitive search
- [ ] "X" button to clear search
- [ ] Shows count of matching results: "Showing X of Y projects"

### US-02.3: Filter by Status

**As a** user,
**I want to** filter projects by status,
**So that** I can focus on active or completed projects.

**Acceptance Criteria:**

- [ ] Toggle/tabs: "Active" (default) | "All"
- [ ] "Active" shows only ACTIVE and ON_HOLD projects
- [ ] "All" shows all statuses including COMPLETED and CANCELLED
- [ ] Filter works in combination with search
- [ ] Count updates to reflect filtered results

### US-02.4: Create New Project

**As an** Admin,
**I want to** create a new project,
**So that** I can start tracking costs for a new job.

**Acceptance Criteria:**

- [ ] "+ New Project" button visible only to Admin role
- [ ] Opens a modal/dialog with form fields:
  - Name (required, max 255 chars)
  - Job Number (required, format: `##XXX####` e.g., `25CON0001`)
  - Contract Amount (required, positive number, currency input)
  - Budgeted GP% (required, 0-100)
  - Burden % (optional, default from system setting)
  - Start Date (required, date picker)
  - End Date (required, must be >= start date)
- [ ] Real-time validation on all fields
- [ ] Job number format validated with regex: `/^\d{2}[A-Z]{3}\d{4}$/`
- [ ] On submit: POST `/api/projects`
- [ ] On success: close modal, show success toast, new card appears in grid
- [ ] On duplicate job number: show "Job number already exists" error
- [ ] On failure: show error message, keep modal open
- [ ] PM and Viewer roles: button is hidden

### US-02.5: Navigate to Project

**As a** user,
**I want to** click a project card to enter it,
**So that** I can view and manage its data.

**Acceptance Criteria:**

- [ ] Clicking a card navigates to `/projects/{id}` (Dashboard)
- [ ] Project context is stored (selected project ID)
- [ ] Header shows selected project name and job number
- [ ] Tab navigation becomes available (Dashboard, Budget, Employees, etc.)

## UI/UX Requirements

- Page title: "Projects" or "Select a Project"
- Search bar with magnifying glass icon
- Cards have subtle hover effect (shadow/border)
- Cards show a colored left border matching status
- Currency formatted with `$` and thousands separators
- GP% shown with 1 decimal place
- "+ New Project" button is prominent (primary color)
- Desktop-optimized layout (1920×1080)
- Loading skeleton cards while fetching

## Business Rules

| Rule               | Description                                            |
| ------------------ | ------------------------------------------------------ |
| Project Visibility | Admin: all projects. PM/Viewer: assigned projects only |
| Create Permission  | Admin only                                             |
| Job Number Format  | `##XXX####` (2 digits, 3 uppercase letters, 4 digits)  |
| Job Number Unique  | No two projects can share the same job number          |
| Default Status     | New projects are created as ACTIVE                     |
| Contract Amount    | Must be positive, max 999,999,999.99                   |
| GP% Range          | 0 to 100                                               |
| Date Validation    | End date must be >= Start date                         |

## API Endpoints

| Action         | Method | Endpoint                                                        |
| -------------- | ------ | --------------------------------------------------------------- |
| List projects  | GET    | `/api/projects?status={status}&page={page}&pageSize={pageSize}` |
| Create project | POST   | `/api/projects`                                                 |

## Permissions

| Action            | Admin  | PM          | Viewer      |
| ----------------- | ------ | ----------- | ----------- |
| View project list | ✅ All | ✅ Assigned | ✅ Assigned |
| Create project    | ✅     | ❌          | ❌          |

## Dependencies

- Spec 01 (Authentication) — user must be logged in
- Backend: Projects API (list, create)

## Edge Cases

- User has no assigned projects → show empty state with message
- API returns error → show error banner with retry button
- Very long project name → truncate with ellipsis on card, full name on hover tooltip
- User creates project while search/filter is active → new project appears if it matches filters
- Concurrent creation of same job number → backend returns 409, show duplicate error
