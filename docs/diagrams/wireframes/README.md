# UI Wireframes

PlantUML Salt wireframes for all MVP screens. Each screen is a separate `.puml` file.

## Authentication

### 01 — Login

![Login](01-login.png)

### 01b — MFA Verification

![MFA](01b-mfa.png)

### 01c — New Password

![New Password](01c-new-password.png)

## Project Screens

### 02 — Project Selection

![Project Selection](02-project-selection.png)

### 03 — Dashboard

![Dashboard](03-dashboard.png)

### 04 — Budget Entry

![Budget Entry](04-budget-entry.png)

### 04b — Budget Line Modal

![Budget Modal](04b-budget-modal.png)

### 05 — Employee Roster

![Employee Roster](05-employee-roster.png)

### 05b — Employee Modal

![Employee Modal](05b-employee-modal.png)

### 06 — Daily Time Entry

![Daily Time Entry](06-daily-time-entry.png)

### 07 — Monthly Actuals

![Monthly Actuals](07-monthly-actuals.png)

### 08 — Projections

![Projections](08-projections.png)

### 09 — Reports

![Reports](09-reports.png)

## Setup / Admin Screens

### 10 — Cost Codes

![Cost Codes](10-cost-codes.png)

### 11 — Labor Rates

![Labor Rates](11-labor-rates.png)

### 12 — Equipment Catalog

![Equipment Catalog](12-equipment-catalog.png)

### 13 — User Management

![User Management](13-user-management.png)

## Generating PNGs

```bash
# Generate all wireframes
for f in docs/diagrams/wireframes/*.puml; do
  plantuml "$f"
done
```
