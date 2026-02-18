# Database Conventions

This document defines database design patterns and conventions for PostgreSQL with Aurora Serverless v2.

## Table Naming

### Naming Rules

- Use UPPERCASE for table names
- Use singular nouns (PROJECTS, not PROJECT)
- Use underscores for multi-word tables
- Keep names descriptive but concise

```sql
✅ Good:
PROJECTS
BUDGET_LINES
DAILY_TIME_ENTRIES
PROJECTION_SNAPSHOTS

❌ Bad:
project
Projects
budget-lines
DailyTimeEntry
```

## Column Naming

### Naming Rules

- Use snake_case for all columns
- Use descriptive names
- Avoid abbreviations unless standard
- Use consistent suffixes

```sql
✅ Good:
project_id
contract_amount
budgeted_gp_pct
created_at
updated_at

❌ Bad:
ProjectID
contractAmt
budgetedGP
createdDate
```

### Standard Column Suffixes

| Suffix    | Purpose              | Example                           |
| --------- | -------------------- | --------------------------------- |
| `_id`     | Primary/Foreign keys | `project_id`, `user_id`           |
| `_at`     | Timestamps           | `created_at`, `updated_at`        |
| `_date`   | Date only            | `start_date`, `end_date`          |
| `_pct`    | Percentages          | `budgeted_gp_pct`, `burden_pct`   |
| `_amount` | Currency             | `contract_amount`, `total_amount` |
| `_count`  | Counts               | `employee_count`, `line_count`    |

## Primary Keys

```sql
-- ✅ Use UUID for all primary keys
CREATE TABLE PROJECTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ Don't use auto-increment integers
CREATE TABLE PROJECTS (
  id SERIAL PRIMARY KEY,  -- Avoid
  name VARCHAR(255)
);
```

## Foreign Keys

### Naming Convention

```
fk_{table}_{referenced_table}
```

### Implementation

```sql
-- ✅ Good - Explicit constraint names
CREATE TABLE BUDGET_LINES (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  cost_code_id UUID NOT NULL,

  CONSTRAINT fk_budget_lines_projects
    FOREIGN KEY (project_id)
    REFERENCES PROJECTS(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_budget_lines_cost_codes
    FOREIGN KEY (cost_code_id)
    REFERENCES COST_CODES(id)
    ON DELETE RESTRICT
);

-- ❌ Bad - No constraint name
ALTER TABLE BUDGET_LINES
  ADD FOREIGN KEY (project_id) REFERENCES PROJECTS(id);
```

### ON DELETE Behavior

| Action   | When to Use                                                              |
| -------- | ------------------------------------------------------------------------ |
| CASCADE  | Child records should be deleted with parent (budget lines, time entries) |
| RESTRICT | Prevent deletion if children exist (cost codes, employees)               |
| SET NULL | Rare - only for optional relationships                                   |

## Indexes

### Naming Convention

```
idx_{table}_{column(s)}
```

### Standard Indexes

```sql
-- ✅ Foreign keys (always index)
CREATE INDEX idx_budget_lines_project_id
  ON BUDGET_LINES(project_id);

-- ✅ Frequently queried columns
CREATE INDEX idx_projects_status
  ON PROJECTS(status);

-- ✅ Composite indexes for common queries
CREATE INDEX idx_daily_time_entries_project_date
  ON DAILY_TIME_ENTRIES(project_id, entry_date);

-- ✅ Unique constraints
CREATE UNIQUE INDEX idx_projects_job_number
  ON PROJECTS(job_number);
```

### Index Guidelines

- Index all foreign keys
- Index columns used in WHERE clauses
- Index columns used in ORDER BY
- Consider composite indexes for multi-column queries
- Don't over-index (slows writes)

## Timestamps

### Standard Pattern

```sql
-- ✅ Every table should have these
CREATE TABLE PROJECTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... other columns ...
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON PROJECTS
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Data Types

### Standard Types

| Use Case    | Type          | Example                         |
| ----------- | ------------- | ------------------------------- |
| IDs         | UUID          | `id UUID`                       |
| Short text  | VARCHAR(n)    | `name VARCHAR(255)`             |
| Long text   | TEXT          | `notes TEXT`                    |
| Currency    | DECIMAL(15,2) | `contract_amount DECIMAL(15,2)` |
| Percentages | DECIMAL(5,2)  | `budgeted_gp_pct DECIMAL(5,2)`  |
| Integers    | INTEGER       | `employee_count INTEGER`        |
| Decimals    | DECIMAL(10,2) | `hours_st DECIMAL(10,2)`        |
| Dates       | DATE          | `start_date DATE`               |
| Timestamps  | TIMESTAMP     | `created_at TIMESTAMP`          |
| Booleans    | BOOLEAN       | `is_active BOOLEAN`             |
| Enums       | VARCHAR(50)   | `status VARCHAR(50)`            |

### Currency Fields

```sql
-- ✅ Use DECIMAL(15,2) for currency
contract_amount DECIMAL(15,2) NOT NULL,
total_cost DECIMAL(15,2) DEFAULT 0,

-- ❌ Don't use FLOAT or REAL
contract_amount FLOAT,  -- Precision issues!
```

### Percentage Fields

```sql
-- ✅ Store as decimal (31.5% = 31.5)
budgeted_gp_pct DECIMAL(5,2) NOT NULL,

-- ❌ Don't store as fraction (0.315)
budgeted_gp_pct DECIMAL(5,4),  -- Confusing
```

## Enums and Status Fields

### Pattern

```sql
-- ✅ Use VARCHAR with CHECK constraint
CREATE TABLE PROJECTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',

  CONSTRAINT chk_projects_status
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'))
);

-- ❌ Don't use PostgreSQL ENUMs (hard to modify)
CREATE TYPE project_status AS ENUM ('ACTIVE', 'COMPLETED');
CREATE TABLE PROJECTS (
  status project_status  -- Avoid
);
```

## Soft Deletes

```sql
-- ✅ Add deleted_at for soft deletes
CREATE TABLE PROJECTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for active records
CREATE INDEX idx_projects_active
  ON PROJECTS(id)
  WHERE deleted_at IS NULL;

-- Query active records
SELECT * FROM PROJECTS WHERE deleted_at IS NULL;
```

## Audit Fields

```sql
-- ✅ Track who created/updated records
CREATE TABLE PROJECTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,

  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_projects_created_by
    FOREIGN KEY (created_by) REFERENCES USERS(id),
  CONSTRAINT fk_projects_updated_by
    FOREIGN KEY (updated_by) REFERENCES USERS(id)
);
```

## Migration Pattern

### File Naming

```
migrations/
├── 001_create_users_table.sql
├── 002_create_projects_table.sql
├── 003_create_budget_lines_table.sql
├── 004_add_burden_pct_to_projects.sql
└── 005_create_indexes.sql
```

### Migration Template

```sql
-- Migration: 001_create_projects_table.sql
-- Description: Create PROJECTS table with core fields
-- Author: [Name]
-- Date: 2025-01-15

BEGIN;

CREATE TABLE PROJECTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  job_number VARCHAR(50) NOT NULL,
  contract_amount DECIMAL(15,2) NOT NULL,
  budgeted_gp_pct DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',

  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_projects_status
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED')),
  CONSTRAINT chk_projects_dates
    CHECK (end_date >= start_date),
  CONSTRAINT chk_projects_contract_amount
    CHECK (contract_amount > 0)
);

CREATE UNIQUE INDEX idx_projects_job_number
  ON PROJECTS(job_number);

CREATE INDEX idx_projects_status
  ON PROJECTS(status);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON PROJECTS
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### Rollback Template

```sql
-- Rollback: 001_create_projects_table.sql

BEGIN;

DROP TRIGGER IF EXISTS update_projects_updated_at ON PROJECTS;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_job_number;
DROP TABLE IF EXISTS PROJECTS;

COMMIT;
```

## Constraints

### Check Constraints

```sql
-- ✅ Validate data at database level
CREATE TABLE PROJECTS (
  contract_amount DECIMAL(15,2) NOT NULL,
  budgeted_gp_pct DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  CONSTRAINT chk_projects_contract_amount
    CHECK (contract_amount > 0),
  CONSTRAINT chk_projects_gp_pct
    CHECK (budgeted_gp_pct BETWEEN 0 AND 100),
  CONSTRAINT chk_projects_dates
    CHECK (end_date >= start_date)
);
```

### Unique Constraints

```sql
-- ✅ Enforce uniqueness
CREATE TABLE PROJECTS (
  job_number VARCHAR(50) NOT NULL,

  CONSTRAINT uq_projects_job_number UNIQUE (job_number)
);

-- ✅ Composite unique constraint
CREATE TABLE DAILY_TIME_ENTRIES (
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  cost_code_id UUID NOT NULL,

  CONSTRAINT uq_time_entries
    UNIQUE (project_id, employee_id, entry_date, cost_code_id)
);
```

## Query Patterns

### Efficient Queries

```sql
-- ✅ Use indexes effectively
SELECT * FROM PROJECTS
WHERE status = 'ACTIVE'  -- Indexed
ORDER BY name;

-- ✅ Use JOINs instead of subqueries
SELECT p.*, COUNT(b.id) as budget_line_count
FROM PROJECTS p
LEFT JOIN BUDGET_LINES b ON b.project_id = p.id
WHERE p.status = 'ACTIVE'
GROUP BY p.id;

-- ❌ Avoid N+1 queries
-- Bad: Query in loop
for project in projects:
  budget_lines = query("SELECT * FROM BUDGET_LINES WHERE project_id = ?", project.id)

-- Good: Single query with JOIN
SELECT p.*, b.*
FROM PROJECTS p
LEFT JOIN BUDGET_LINES b ON b.project_id = p.id
WHERE p.status = 'ACTIVE';
```

### Aggregations

```sql
-- ✅ Efficient aggregation
SELECT
  project_id,
  SUM(hours_st) as total_st_hours,
  SUM(hours_ot) as total_ot_hours,
  SUM(hours_dt) as total_dt_hours
FROM DAILY_TIME_ENTRIES
WHERE entry_date BETWEEN '2025-01-01' AND '2025-01-31'
GROUP BY project_id;
```

## Connection Management (RDS Proxy)

Connection pooling is handled by **AWS RDS Proxy**, not by the application. Lambda functions connect to the RDS Proxy endpoint, which manages a shared connection pool across all concurrent Lambda invocations.

### Why RDS Proxy (not pg.Pool)

- Lambda can spawn hundreds of concurrent containers, each opening connections
- With `pg.Pool` per Lambda, 50 concurrent invocations = 100+ connections to Aurora
- RDS Proxy centralizes pooling: all Lambdas connect to the proxy, which maintains a shared pool
- RDS Proxy also handles automatic failover and credential rotation

### Lambda Database Client

```typescript
// lambda/shared/db.ts
import { Client } from "pg";

let client: Client | null = null;

async function getClient(): Promise<Client> {
  if (client) return client;

  const credentials = await getSecret(process.env.DATABASE_SECRET_ARN);
  const host = process.env.RDS_PROXY_ENDPOINT || credentials.host;

  client = new Client({
    host,
    port: credentials.port,
    database: credentials.database,
    user: credentials.username,
    password: credentials.password,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: true },
  });

  await client.connect();
  return client;
}

export async function query(sql: string, params: any[]) {
  const db = await getClient();
  return db.query(sql, params);
}
```

### Key Differences from pg.Pool

- Use `Client` (single connection) instead of `Pool`
- No `max`, `idleTimeoutMillis` settings — RDS Proxy handles that
- No `client.release()` — the client stays open for Lambda container reuse
- `RDS_PROXY_ENDPOINT` env var points to the proxy, not the Aurora cluster

## Transactions

```typescript
// ✅ Use transactions for multi-table operations via shared/db.ts
import { transaction } from "../../shared/db";

const projectId = await transaction(async (client) => {
  const projectResult = await client.query(
    "INSERT INTO PROJECTS (name, job_number) VALUES ($1, $2) RETURNING id",
    [projectData.name, projectData.jobNumber],
  );
  const id = projectResult.rows[0].id;

  for (const line of budgetLines) {
    await client.query(
      "INSERT INTO BUDGET_LINES (project_id, cost_code_id) VALUES ($1, $2)",
      [id, line.costCodeId],
    );
  }

  return id;
});
```

## Common Pitfalls

❌ **Don't:**

- Use auto-increment IDs (use UUID)
- Use PostgreSQL ENUMs (hard to modify)
- Store currency as FLOAT
- Forget to index foreign keys
- Use SELECT \* in production code
- Create indexes on every column

✅ **Do:**

- Use UUID for all primary keys
- Use VARCHAR with CHECK constraints for enums
- Use DECIMAL for currency and percentages
- Index foreign keys and frequently queried columns
- Select only needed columns
- Add timestamps to all tables
- Use transactions for multi-table operations
- Add CHECK constraints for data validation
