# Flow Diagrams

Sequence diagrams showing user and system interactions.

## Diagrams

### 01. Authentication Flow

**File:** `01-authentication.puml`

Complete authentication flows including email/password login, Microsoft SSO, MFA setup, token refresh, and logout.

**Flows:** Login (Email/Password), Login (SSO), MFA Setup, API Calls, Token Refresh, Logout

**View:** [PNG](Authentication%20Flow.png) | [Source](01-authentication.puml)

---

### 02. Project Creation Flow

**File:** `02-project-creation.puml`

Detailed sequence diagram for creating a new project, including validation, permissions, database transactions, and error handling.

**Steps:** Form Validation → API Request → Permission Check → Database Transaction → Response

**View:** [PNG](Project%20Creation%20Flow.png) | [Source](02-project-creation.puml)

---

### 03. Time Entry Flow

**File:** `03-time-entry.puml`

Daily time entry workflow showing how project managers enter time for multiple employees, handle duplicates, and calculate summaries.

**Steps:** Load Employees → Enter Time → Batch Save → Calculate Summary

**View:** [PNG](Daily%20Time%20Entry%20Flow.png) | [Source](03-time-entry.puml)

---

[← Back to Diagrams](../README.md)
