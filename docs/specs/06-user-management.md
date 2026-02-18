# 06 - User Management

## Overview

Admin-only screen for managing application users. Users are created in Cognito and assigned roles (Admin, Project Manager, Viewer). Self-registration is disabled.

## Screen

- `/setup/users` — UserManagementPage

## User Stories

### US-06.1: View Users

**As an** Admin,
**I want to** see all users and their roles,
**So that** I can manage access to the system.

**Acceptance Criteria:**

- [ ] Table with columns: Name, Email, Role, Status (Active/Disabled), Created Date
- [ ] Sortable by any column
- [ ] Default sort: by Name ascending
- [ ] Search by name or email
- [ ] Role filter: All | Admin | Project Manager | Viewer
- [ ] Non-Admin users redirected to `/` if they try to access this page

### US-06.2: Create User

**As an** Admin,
**I want to** create a new user account,
**So that** team members can access the system.

**Acceptance Criteria:**

- [ ] "+ Add User" button
- [ ] Modal with fields:
  - Email (required, valid email format, unique)
  - First Name (required, max 100 chars)
  - Last Name (required, max 100 chars)
  - Role (required, dropdown: Admin, Project Manager, Viewer)
- [ ] On submit: creates user in Cognito with temporary password
- [ ] Cognito sends invitation email with temporary password
- [ ] User must change password on first login (NEW_PASSWORD_REQUIRED challenge)
- [ ] On duplicate email: show "User with this email already exists"
- [ ] On success: close modal, toast "User created. Invitation sent to {email}"

### US-06.3: Edit User Role

**As an** Admin,
**I want to** change a user's role,
**So that** I can adjust permissions as responsibilities change.

**Acceptance Criteria:**

- [ ] Edit icon on each row
- [ ] Modal with current values, role dropdown editable
- [ ] Changing role updates Cognito group membership
- [ ] Cannot change own role (prevent Admin from demoting themselves)
- [ ] If promoting to Admin, show warning: "Admin users are required to enable MFA"
- [ ] On success: toast "Role updated"

### US-06.4: Disable/Enable User

**As an** Admin,
**I want to** disable a user account,
**So that** former team members can't access the system.

**Acceptance Criteria:**

- [ ] Toggle switch on each row
- [ ] Disable: user cannot log in, existing sessions invalidated
- [ ] Enable: user can log in again
- [ ] Cannot disable own account
- [ ] Confirmation dialog: "Disable {name}? They will be logged out immediately."
- [ ] Disabled users shown with muted styling

### US-06.5: Reset User Password

**As an** Admin,
**I want to** reset a user's password,
**So that** I can help users who are locked out.

**Acceptance Criteria:**

- [ ] "Reset Password" action in row menu
- [ ] Confirmation dialog
- [ ] Cognito sends new temporary password to user's email
- [ ] User must change password on next login

## UI/UX Requirements

- Table layout consistent with other setup screens
- Role shown as colored badge (Admin=red, PM=blue, Viewer=gray)
- Status shown as green/red dot
- Only accessible to Admin role (route guard)
- Actions menu (edit, disable, reset) as dropdown on each row

## Business Rules

| Rule                 | Description                                         |
| -------------------- | --------------------------------------------------- |
| Admin Only           | Only Admin can access this page                     |
| No Self-Registration | Users are created by Admin only                     |
| Self-Protection      | Cannot change own role or disable own account       |
| MFA for Admin        | Admin role requires MFA (enforced at Cognito level) |
| Email Unique         | No two users can share the same email               |
| Soft Disable         | Disabling preserves user data, prevents login       |
| Invitation Email     | Cognito sends temporary password on user creation   |

## API Endpoints

| Action         | Method | Endpoint                         |
| -------------- | ------ | -------------------------------- |
| List users     | GET    | `/api/users`                     |
| Create user    | POST   | `/api/users`                     |
| Update user    | PUT    | `/api/users/{id}`                |
| Disable user   | PATCH  | `/api/users/{id}/disable`        |
| Enable user    | PATCH  | `/api/users/{id}/enable`         |
| Reset password | POST   | `/api/users/{id}/reset-password` |

Note: These endpoints interact with Cognito Admin API on the backend.

## Permissions

| Action         | Admin | PM  | Viewer |
| -------------- | ----- | --- | ------ |
| View users     | ✅    | ❌  | ❌     |
| Create user    | ✅    | ❌  | ❌     |
| Edit user      | ✅    | ❌  | ❌     |
| Disable/Enable | ✅    | ❌  | ❌     |
| Reset password | ✅    | ❌  | ❌     |

## Dependencies

- Spec 01 (Authentication)
- AWS Cognito Admin API access from Lambda
- Backend: Users API with Cognito integration

## Edge Cases

- Creating user with email that exists in Cognito but not in app DB → sync from Cognito
- Disabling the last Admin → prevent (must have at least 1 active Admin)
- SSO user management → SSO users auto-provisioned, Admin can change their role
- User created via SSO tries to use email/password → should work if password is set
