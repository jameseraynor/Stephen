# 09 - Employee Roster

## Overview

Manage the list of crew members assigned to a project. Each employee has a classification (linked to labor rate), home branch, project role, and assignment dates. Used for time entry.

## Screen

- `/projects/:id/employees` — EmployeeRosterPage

## User Stories

### US-09.1: View Employee Roster

**As a** user,
**I want to** see all employees assigned to the project,
**So that** I can review the crew composition.

**Acceptance Criteria:**

- [ ] Table with columns: Name, Classification (labor rate description), Home Branch, Project Role, Start Date, End Date, Status
- [ ] Status: Active (green) / Inactive (gray)
- [ ] Sortable by any column
- [ ] Default sort: Active first, then by Name
- [ ] Shows count: "X active employees, Y total"
- [ ] Filter toggle: "Show inactive" (off by default)

### US-09.2: Search Employees

**As a** user,
**I want to** search employees by name,
**So that** I can quickly find a specific crew member.

**Acceptance Criteria:**

- [ ] Search input above the table
- [ ] Filters by name (first + last), case-insensitive
- [ ] Debounced 300ms

### US-09.3: Add Employee

**As an** Admin or PM,
**I want to** add an employee to the project,
**So that** they can be assigned time entries.

**Acceptance Criteria:**

- [ ] "+ Add Employee" button (Admin/PM only)
- [ ] Modal with fields:
  - Name (required, max 255 chars)
  - Classification (required, dropdown of active labor rates — shows code + description + rate)
  - Home Branch (optional, max 100 chars, e.g., "Austin", "Dallas")
  - Project Role (optional, max 100 chars, e.g., "Foreman", "Superintendent")
  - Start Date (required, date picker, defaults to today)
  - End Date (optional, date picker, must be >= start date)
- [ ] On success: close modal, toast "Employee added", table refreshes

### US-09.4: Edit Employee

**As an** Admin or PM,
**I want to** edit an employee's details,
**So that** I can update their role or classification.

**Acceptance Criteria:**

- [ ] Edit icon on each row (Admin/PM only)
- [ ] Modal pre-filled with current values
- [ ] All fields editable
- [ ] Changing classification shows warning: "Changing classification will affect future cost calculations"
- [ ] On success: close modal, toast, table refreshes

### US-09.5: Deactivate Employee

**As an** Admin or PM,
**I want to** deactivate an employee who left the project,
**So that** they no longer appear in time entry dropdowns.

**Acceptance Criteria:**

- [ ] "Deactivate" action on each active row (Admin/PM only)
- [ ] Sets end_date to today (if not already set) and is_active to false
- [ ] Confirmation dialog: "Deactivate {name}? They will no longer appear in time entry."
- [ ] Inactive employees hidden from time entry employee dropdown
- [ ] Existing time entries for this employee are preserved
- [ ] Can reactivate (sets is_active back to true, clears end_date)

### US-09.6: View Employee Details

**As a** user,
**I want to** see an employee's labor rate details,
**So that** I can understand their cost to the project.

**Acceptance Criteria:**

- [ ] Clicking an employee row or info icon shows details:
  - Full name
  - Classification with rate details (base rate, burden %, burdened rate)
  - Home branch
  - Project role
  - Assignment dates
  - Total hours logged on this project (from time entries)
- [ ] Details shown in a side panel or expanded row

## UI/UX Requirements

- Table layout consistent with other screens
- Classification column shows labor rate code + description
- Status shown as colored dot (green=active, gray=inactive)
- Date columns formatted as MM/DD/YYYY
- Admin/PM actions hidden for Viewer role
- Read-only mode when project is not ACTIVE
- Empty state: "No employees assigned. Click '+ Add Employee' to start."

## Business Rules

| Rule                    | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| Project Scope           | Employees are assigned per project (same person can be on multiple projects) |
| Classification Required | Every employee must have a labor rate classification                         |
| Soft Deactivation       | Deactivating hides from time entry, preserves historical data                |
| Date Validation         | End date must be >= start date (if provided)                                 |
| Rate Inheritance        | Employee's cost is calculated using their classification's burdened rate     |
| Project Must Be ACTIVE  | Cannot add/edit employees if project is not ACTIVE                           |

## API Endpoints

| Action          | Method | Endpoint                                              |
| --------------- | ------ | ----------------------------------------------------- |
| List employees  | GET    | `/api/projects/{projectId}/employees?isActive={bool}` |
| Add employee    | POST   | `/api/projects/{projectId}/employees`                 |
| Update employee | PUT    | `/api/projects/{projectId}/employees/{id}`            |
| Remove employee | DELETE | `/api/projects/{projectId}/employees/{id}`            |
| Get labor rates | GET    | `/api/labor-rates`                                    |

## Permissions

| Action        | Admin | PM            | Viewer        |
| ------------- | ----- | ------------- | ------------- |
| View roster   | ✅    | ✅ (assigned) | ✅ (assigned) |
| Add employee  | ✅    | ✅ (assigned) | ❌            |
| Edit employee | ✅    | ✅ (assigned) | ❌            |
| Deactivate    | ✅    | ✅ (assigned) | ❌            |

## Dependencies

- Spec 01 (Authentication)
- Spec 02 (Project Selection) — project context
- Spec 04 (Labor Rates) — classification dropdown
- Backend: Employees API, Labor Rates API

## Edge Cases

- Same person name on multiple projects → allowed (different employee records per project)
- Deactivating employee with future time entries → warn but allow
- Labor rate deactivated after employee assigned → employee keeps rate, shown as "(inactive rate)"
- No active labor rates → cannot add employees, show message
- Employee with no time entries → can be hard-deleted (vs deactivated)
