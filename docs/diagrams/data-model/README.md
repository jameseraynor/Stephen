# Data Model Diagrams

Database schema and data flow documentation.

## Diagrams

### 01. Database Schema (ERD)

**File:** `01-database-schema.puml`

Entity-Relationship Diagram showing all database tables, columns, relationships, and constraints.

**Tables:** USERS, PROJECTS, BUDGET_LINES, COST_CODES, EMPLOYEES, LABOR_RATES, DAILY_TIME_ENTRIES, ACTUALS, PROJECTION_SNAPSHOTS, PROJECTION_DETAILS

**View:** [PNG](Database%20ERD.png) | [Source](01-database-schema.puml)

---

### 02. Data Pipeline

**File:** `02-data-pipeline.puml`

Data flow from input sources through storage, calculations, to outputs. Includes business logic formulas.

**Stages:** Input → Entry → Storage → Calculations → Outputs

**View:** [PNG](Data%20Flow.png) | [Source](02-data-pipeline.puml)

---

[← Back to Diagrams](../README.md)
