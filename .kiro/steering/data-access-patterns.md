---
inclusion: auto
---

# Data Access Patterns

This document defines conventions for writing SQL queries, repository methods, and data mapping in the repository layer. It complements `backend-architecture.md` (code structure) and `database-conventions.md` (schema design).

## DECIMAL Handling in TypeScript

PostgreSQL returns `DECIMAL`/`NUMERIC` columns as strings in `pg`. Always convert explicitly.

```typescript
// ✅ Good — explicit Number() conversion in toOutput()
private toOutput(row: ProjectRow): ProjectOutput {
  return {
    id: row.id,
    contractAmount: Number(row.contract_amount),
    budgetedGpPct: Number(row.budgeted_gp_pct),
    burdenPct: row.burden_pct ? Number(row.burden_pct) : undefined,
  };
}

// ❌ Bad — trusting pg to return numbers
return { contractAmount: row.contract_amount }; // This is a string!
```

### Rules

- Every `DECIMAL` column must be wrapped in `Number()` in the `toOutput()` mapper
- Nullable DECIMAL: use ternary `row.col ? Number(row.col) : undefined`
- Never pass DECIMAL values directly to JSON response without conversion

## Pagination Pattern

All list endpoints must support pagination. Use LIMIT/OFFSET with a separate COUNT query.

```typescript
// In repository
async findAll(params: ListParams): Promise<{ rows: ProjectRow[]; total: number }> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Build WHERE clause from optional filters
  if (params.status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(params.status);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // Count query (same WHERE, no LIMIT)
  const countSql = `SELECT COUNT(*) as total FROM PROJECTS ${whereClause}`;
  const countResult = await query(countSql, values);
  const total = parseInt(countResult.rows[0].total, 10);

  // Data query (with LIMIT/OFFSET and ORDER BY)
  const offset = (params.page - 1) * params.pageSize;
  const dataSql = `
    SELECT id, name, job_number, contract_amount, budgeted_gp_pct,
           burden_pct, start_date, end_date, status, created_at, updated_at
    FROM PROJECTS
    ${whereClause}
    ORDER BY ${this.getSortColumn(params.sort)} ${params.order === 'desc' ? 'DESC' : 'ASC'}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  const dataResult = await query(dataSql, [...values, params.pageSize, offset]);

  return { rows: dataResult.rows, total };
}
```

### Rules

- Always run COUNT and SELECT as two separate queries (not `COUNT(*) OVER()` — it forces full scan)
- COUNT query uses the same WHERE clause but no ORDER BY, LIMIT, or OFFSET
- Default page = 1, pageSize = 20, max pageSize = 100
- `parseInt(row.total, 10)` — COUNT returns string in pg

## Dynamic Filtering

Build WHERE clauses dynamically using a conditions array and parameterized values.

```typescript
// ✅ Good — dynamic filter builder
async findAll(filters: ProjectFilters): Promise<{ rows: ProjectRow[]; total: number }> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`p.status = $${paramIndex++}`);
    values.push(filters.status);
  }

  if (filters.search) {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.job_number ILIKE $${paramIndex})`);
    values.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.startDateFrom) {
    conditions.push(`p.start_date >= $${paramIndex++}`);
    values.push(filters.startDateFrom);
  }

  if (filters.startDateTo) {
    conditions.push(`p.start_date <= $${paramIndex++}`);
    values.push(filters.startDateTo);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // ... use whereClause in COUNT and SELECT queries
}
```

### Rules

- Use `paramIndex++` to track `$N` placeholders — never hardcode numbers
- Use `ILIKE` for case-insensitive search (PostgreSQL-specific, fine for our stack)
- Wrap search terms with `%` for partial matching
- For multi-column search, reuse the same `$N` parameter: `(col1 ILIKE $N OR col2 ILIKE $N)`
- Never concatenate user input into SQL — always use parameterized queries

## Safe Sorting (ORDER BY Whitelist)

ORDER BY is vulnerable to SQL injection because column names cannot be parameterized. Use a whitelist.

```typescript
// ✅ Good — whitelist in repository
private static readonly SORT_COLUMNS: Record<string, string> = {
  name: 'p.name',
  jobNumber: 'p.job_number',
  contractAmount: 'p.contract_amount',
  status: 'p.status',
  startDate: 'p.start_date',
  endDate: 'p.end_date',
  createdAt: 'p.created_at',
};

private getSortColumn(sort?: string): string {
  if (!sort || !ProjectsRepository.SORT_COLUMNS[sort]) {
    return 'p.created_at'; // Default sort
  }
  return ProjectsRepository.SORT_COLUMNS[sort];
}

// Usage in SQL
const orderDirection = params.order === 'desc' ? 'DESC' : 'ASC';
const sql = `... ORDER BY ${this.getSortColumn(params.sort)} ${orderDirection}`;
```

### Rules

- Every repository with a list method must define a `SORT_COLUMNS` whitelist
- Map camelCase API field names to snake_case SQL column names with table alias
- Default sort is always `created_at DESC` (newest first) unless domain requires otherwise
- Order direction is validated to only `ASC` or `DESC` — never from user input directly
- The whitelist is `static readonly` on the repository class

## JOIN Patterns

### Budget Lines with Cost Code Details

```sql
SELECT bl.id, bl.project_id, bl.budgeted_amount, bl.budgeted_quantity,
       bl.budgeted_unit_cost, bl.description, bl.notes,
       cc.code as cost_code, cc.description as cost_code_description, cc.type as cost_code_type
FROM BUDGET_LINES bl
JOIN COST_CODES cc ON cc.id = bl.cost_code_id
WHERE bl.project_id = $1
ORDER BY cc.code ASC
```

### Employees with Labor Rate

```sql
SELECT e.id, e.name, e.home_branch, e.project_role, e.assigned_date,
       e.end_date, e.is_active,
       lr.code as labor_rate_code, lr.description as labor_rate_description,
       lr.hourly_rate
FROM EMPLOYEES e
JOIN LABOR_RATES lr ON lr.id = e.labor_rate_id
WHERE e.project_id = $1 AND e.is_active = true
ORDER BY e.name ASC
```

### Time Entries with Employee and Cost Code

```sql
SELECT dte.id, dte.entry_date, dte.hours_st, dte.hours_ot, dte.hours_dt,
       dte.source, dte.notes,
       e.name as employee_name,
       cc.code as cost_code, cc.description as cost_code_description
FROM DAILY_TIME_ENTRIES dte
JOIN EMPLOYEES e ON e.id = dte.employee_id
JOIN COST_CODES cc ON cc.id = dte.cost_code_id
WHERE dte.project_id = $1 AND dte.entry_date BETWEEN $2 AND $3
ORDER BY dte.entry_date DESC, e.name ASC
```

### Rules

- Always use table aliases (2-3 letter abbreviations): `p`, `bl`, `cc`, `e`, `lr`, `dte`, `a`, `ps`, `pd`
- Standard aliases across all repositories:
  - `p` = PROJECTS
  - `bl` = BUDGET_LINES
  - `cc` = COST_CODES
  - `e` = EMPLOYEES
  - `lr` = LABOR_RATES
  - `dte` = DAILY_TIME_ENTRIES
  - `a` = ACTUALS
  - `ps` = PROJECTION_SNAPSHOTS
  - `pd` = PROJECTION_DETAILS
  - `u` = USERS
- Use `JOIN` (not `LEFT JOIN`) when the FK is NOT NULL — the related row must exist
- Use `LEFT JOIN` only when the FK is nullable or you need rows even without matches
- Alias joined columns to avoid name collisions: `cc.description as cost_code_description`

## Aggregation Patterns

### Project Budget Summary (total budgeted by cost type)

```sql
SELECT cc.type as cost_type,
       COUNT(bl.id) as line_count,
       SUM(bl.budgeted_amount) as total_budgeted
FROM BUDGET_LINES bl
JOIN COST_CODES cc ON cc.id = bl.cost_code_id
WHERE bl.project_id = $1
GROUP BY cc.type
ORDER BY cc.type
```

### Monthly Actuals Summary

```sql
SELECT a.month,
       SUM(a.actual_amount) as total_actual,
       COUNT(DISTINCT a.cost_code_id) as cost_code_count
FROM ACTUALS a
WHERE a.project_id = $1
GROUP BY a.month
ORDER BY a.month ASC
```

### Time Entry Totals by Employee for a Date Range

```sql
SELECT e.id as employee_id, e.name as employee_name,
       SUM(dte.hours_st) as total_hours_st,
       SUM(dte.hours_ot) as total_hours_ot,
       SUM(dte.hours_dt) as total_hours_dt,
       SUM(dte.hours_st + dte.hours_ot + dte.hours_dt) as total_hours
FROM DAILY_TIME_ENTRIES dte
JOIN EMPLOYEES e ON e.id = dte.employee_id
WHERE dte.project_id = $1 AND dte.entry_date BETWEEN $2 AND $3
GROUP BY e.id, e.name
ORDER BY e.name ASC
```

### Budget vs Actuals Comparison (the core report)

```sql
SELECT cc.id as cost_code_id, cc.code as cost_code, cc.description, cc.type,
       COALESCE(SUM(bl.budgeted_amount), 0) as total_budgeted,
       COALESCE(SUM(a.actual_amount), 0) as total_actual,
       COALESCE(SUM(bl.budgeted_amount), 0) - COALESCE(SUM(a.actual_amount), 0) as variance
FROM COST_CODES cc
LEFT JOIN BUDGET_LINES bl ON bl.cost_code_id = cc.id AND bl.project_id = $1
LEFT JOIN (
  SELECT cost_code_id, SUM(actual_amount) as actual_amount
  FROM ACTUALS
  WHERE project_id = $1
  GROUP BY cost_code_id
) a ON a.cost_code_id = cc.id
WHERE bl.project_id = $1 OR a.cost_code_id IS NOT NULL
GROUP BY cc.id, cc.code, cc.description, cc.type
ORDER BY cc.code ASC
```

### Rules

- Always use `COALESCE(SUM(...), 0)` for aggregations that may have no rows — avoids NULL in results
- Use `COUNT(DISTINCT col)` when counting across JOINs to avoid inflated counts
- For budget vs actuals, pre-aggregate actuals in a subquery to avoid cartesian products with budget lines
- Aggregation results also return DECIMAL as strings — apply `Number()` in `toOutput()`

## Cost Calculation Queries

### Labor Cost Calculation (Hours × Rate × Burden)

```sql
SELECT dte.project_id, dte.cost_code_id,
       TO_CHAR(dte.entry_date, 'YYYY-MM') as month,
       SUM(
         (dte.hours_st * lr.hourly_rate) +
         (dte.hours_ot * lr.hourly_rate * 1.5) +
         (dte.hours_dt * lr.hourly_rate * 2.0)
       ) as base_labor_cost,
       SUM(
         ((dte.hours_st * lr.hourly_rate) +
          (dte.hours_ot * lr.hourly_rate * 1.5) +
          (dte.hours_dt * lr.hourly_rate * 2.0))
         * (1 + COALESCE(p.burden_pct, 0) / 100.0)
       ) as burdened_labor_cost
FROM DAILY_TIME_ENTRIES dte
JOIN EMPLOYEES e ON e.id = dte.employee_id
JOIN LABOR_RATES lr ON lr.id = e.labor_rate_id
JOIN PROJECTS p ON p.id = dte.project_id
WHERE dte.project_id = $1
  AND TO_CHAR(dte.entry_date, 'YYYY-MM') = $2
GROUP BY dte.project_id, dte.cost_code_id, TO_CHAR(dte.entry_date, 'YYYY-MM')
```

### Project GP Summary

```sql
SELECT p.id, p.name, p.contract_amount, p.budgeted_gp_pct,
       COALESCE(budget.total_budgeted, 0) as total_budgeted,
       COALESCE(actuals.total_actual, 0) as total_actual,
       p.contract_amount - COALESCE(actuals.total_actual, 0) as current_gp,
       CASE
         WHEN p.contract_amount > 0
         THEN ((p.contract_amount - COALESCE(actuals.total_actual, 0)) / p.contract_amount * 100)
         ELSE 0
       END as current_gp_pct
FROM PROJECTS p
LEFT JOIN (
  SELECT project_id, SUM(budgeted_amount) as total_budgeted
  FROM BUDGET_LINES
  GROUP BY project_id
) budget ON budget.project_id = p.id
LEFT JOIN (
  SELECT project_id, SUM(actual_amount) as total_actual
  FROM ACTUALS
  GROUP BY project_id
) actuals ON actuals.project_id = p.id
WHERE p.id = $1
```

### Rules

- OT multiplier is 1.5x, DT multiplier is 2.0x — these are constants, not configurable
- Burden is applied as `(1 + burden_pct / 100.0)` — burden_pct is stored as percentage (e.g., 35.0 = 35%)
- Use `COALESCE(p.burden_pct, 0)` since burden_pct is nullable
- GP% = (contract_amount - total_actual) / contract_amount × 100
- Always guard division by zero with `CASE WHEN denominator > 0`

## Upsert Pattern (INSERT ON CONFLICT)

Used for actuals and time entries where a unique constraint exists.

```typescript
// Actuals: unique on (project_id, cost_code_id, month)
async upsert(data: UpsertActualDb): Promise<ActualRow> {
  const sql = `
    INSERT INTO ACTUALS (project_id, cost_code_id, month, actual_amount,
                         actual_quantity, actual_unit_cost, source, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (project_id, cost_code_id, month)
    DO UPDATE SET
      actual_amount = EXCLUDED.actual_amount,
      actual_quantity = EXCLUDED.actual_quantity,
      actual_unit_cost = EXCLUDED.actual_unit_cost,
      source = EXCLUDED.source,
      notes = EXCLUDED.notes
    RETURNING *
  `;
  const result = await query(sql, [
    data.projectId, data.costCodeId, data.month,
    data.actualAmount, data.actualQuantity, data.actualUnitCost,
    data.source, data.notes
  ]);
  return result.rows[0];
}
```

### Rules

- Use `ON CONFLICT (columns) DO UPDATE SET` for upserts — matches the UNIQUE constraint
- Reference new values with `EXCLUDED.column_name`
- Always include `RETURNING *` to get the final row state
- Only use upserts where a natural unique constraint exists (actuals, time entries)
- For regular creates, use plain INSERT and let the constraint throw on duplicates

## Bulk Insert Pattern

For inserting multiple rows in a single query (e.g., budget lines, projection details).

```typescript
async createMany(projectId: string, lines: CreateBudgetLineDb[]): Promise<BudgetLineRow[]> {
  if (lines.length === 0) return [];

  const values: any[] = [];
  const placeholders: string[] = [];
  let paramIndex = 1;

  for (const line of lines) {
    placeholders.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
    values.push(projectId, line.costCodeId, line.description,
                line.budgetedAmount, line.budgetedQuantity, line.budgetedUnitCost);
  }

  const sql = `
    INSERT INTO BUDGET_LINES (project_id, cost_code_id, description,
                              budgeted_amount, budgeted_quantity, budgeted_unit_cost)
    VALUES ${placeholders.join(', ')}
    RETURNING *
  `;
  const result = await query(sql, values);
  return result.rows;
}
```

### Rules

- Build VALUES placeholders dynamically with `paramIndex++`
- Guard with `if (lines.length === 0) return []` — empty INSERT is invalid SQL
- Limit bulk inserts to ~500 rows per query to avoid parameter limit (max 65535 params in pg)
- For larger batches, chunk into groups and wrap in a transaction
- Always use `RETURNING *` to get generated IDs and defaults

## Soft Delete Pattern

Projects use soft delete. Other child tables use CASCADE hard delete from the project.

```typescript
// Soft delete — set deleted_at timestamp
async softDelete(id: string, userId: string): Promise<void> {
  const sql = `
    UPDATE PROJECTS
    SET deleted_at = CURRENT_TIMESTAMP, updated_by = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NULL
  `;
  const result = await query(sql, [id, userId]);
  if (result.rowCount === 0) {
    throw new Error('Project not found or already deleted');
  }
}

// Restore — clear deleted_at
async restore(id: string, userId: string): Promise<void> {
  const sql = `
    UPDATE PROJECTS
    SET deleted_at = NULL, updated_by = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND deleted_at IS NOT NULL
  `;
  const result = await query(sql, [id, userId]);
  if (result.rowCount === 0) {
    throw new Error('Project not found or not deleted');
  }
}
```

### Rules

- All SELECT queries on PROJECTS must include `WHERE deleted_at IS NULL` (unless explicitly querying deleted records)
- The `deleted_at IS NULL` filter applies to COUNT queries too
- Child table queries (budget lines, employees, etc.) don't need soft delete checks — they CASCADE from project
- Only Admin can restore a soft-deleted project

## Existence Check Pattern

Use `SELECT 1` with `LIMIT 1` for existence checks — faster than fetching full rows.

```typescript
async existsByJobNumber(jobNumber: string, excludeId?: string): Promise<boolean> {
  let sql = `SELECT 1 FROM PROJECTS WHERE job_number = $1 AND deleted_at IS NULL`;
  const values: any[] = [jobNumber];

  if (excludeId) {
    sql += ` AND id != $2`;
    values.push(excludeId);
  }

  sql += ` LIMIT 1`;
  const result = await query(sql, values);
  return result.rows.length > 0;
}
```

### Rules

- Use `SELECT 1 ... LIMIT 1` — not `SELECT COUNT(*)` for existence checks
- The `excludeId` parameter is for update operations (exclude the record being updated)
- Always include `deleted_at IS NULL` for soft-deletable tables

## Transaction Patterns

### Multi-Table Create (Project with Budget Lines)

```typescript
async createWithBudget(project: CreateProjectDb, lines: CreateBudgetLineDb[]): Promise<string> {
  return transaction(async (client) => {
    // 1. Insert project
    const projectResult = await client.query(
      `INSERT INTO PROJECTS (name, job_number, contract_amount, budgeted_gp_pct,
                             burden_pct, start_date, end_date, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [project.name, project.jobNumber, project.contractAmount, project.budgetedGpPct,
       project.burdenPct, project.startDate, project.endDate, project.status,
       project.createdBy, project.updatedBy]
    );
    const projectId = projectResult.rows[0].id;

    // 2. Insert budget lines
    for (const line of lines) {
      await client.query(
        `INSERT INTO BUDGET_LINES (project_id, cost_code_id, description,
                                   budgeted_amount, budgeted_quantity, budgeted_unit_cost)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [projectId, line.costCodeId, line.description,
         line.budgetedAmount, line.budgetedQuantity, line.budgetedUnitCost]
      );
    }

    return projectId;
  });
}
```

### Rules

- Use `transaction()` from `shared/db.ts` for any operation that touches 2+ tables
- The callback receives a `client` — use `client.query()`, not the module-level `query()`
- If any query fails, the entire transaction rolls back automatically
- Keep transactions short — no external API calls inside transactions
- Return the result from the callback — `transaction()` returns it after COMMIT

## Update Pattern (Partial Updates)

Build SET clause dynamically from provided fields.

```typescript
async update(id: string, data: UpdateProjectDb): Promise<ProjectRow> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Only update fields that were provided
  if (data.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.contractAmount !== undefined) {
    setClauses.push(`contract_amount = $${paramIndex++}`);
    values.push(data.contractAmount);
  }
  if (data.status !== undefined) {
    setClauses.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  // ... other fields

  // Always update updated_by
  setClauses.push(`updated_by = $${paramIndex++}`);
  values.push(data.updatedBy);

  if (setClauses.length === 1) {
    // Only updated_by — nothing to update
    throw new Error('No fields to update');
  }

  values.push(id); // For WHERE clause
  const sql = `
    UPDATE PROJECTS
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex} AND deleted_at IS NULL
    RETURNING *
  `;
  const result = await query(sql, values);
  if (result.rows.length === 0) {
    throw new Error('Project not found');
  }
  return result.rows[0];
}
```

### Rules

- Check `!== undefined` (not `!= null`) to allow setting values to `null` explicitly
- Always include `updated_by` in every UPDATE
- `updated_at` is handled by the database trigger — don't set it manually
- Include `deleted_at IS NULL` in WHERE for soft-deletable tables
- Use `RETURNING *` to get the updated row without a second query

## Row Type Interfaces

Every repository defines a `Row` interface matching the exact database column names and types returned by `pg`.

```typescript
// Remember: pg returns DECIMAL as string, BOOLEAN as boolean, DATE as string, TIMESTAMP as Date
interface ProjectRow {
  id: string; // UUID → string
  name: string; // VARCHAR → string
  job_number: string; // VARCHAR → string
  contract_amount: string; // DECIMAL(15,2) → string (!)
  budgeted_gp_pct: string; // DECIMAL(5,2) → string (!)
  burden_pct: string | null; // DECIMAL(5,2) nullable → string | null
  start_date: string; // DATE → string (YYYY-MM-DD)
  end_date: string; // DATE → string
  status: string; // VARCHAR → string
  created_by: string; // UUID → string
  updated_by: string; // UUID → string
  created_at: Date; // TIMESTAMP → Date
  updated_at: Date; // TIMESTAMP → Date
  deleted_at: Date | null; // TIMESTAMP nullable → Date | null
}

interface BudgetLineRow {
  id: string;
  project_id: string;
  cost_code_id: string;
  description: string | null; // VARCHAR nullable
  budgeted_amount: string; // DECIMAL → string
  budgeted_quantity: string | null;
  budgeted_unit_cost: string | null;
  notes: string | null; // TEXT nullable
  created_at: Date;
  updated_at: Date;
  // JOIN columns (when joined with COST_CODES)
  cost_code?: string; // cc.code
  cost_code_description?: string; // cc.description
  cost_code_type?: string; // cc.type
}
```

### pg Type Mapping Reference

| PostgreSQL Type  | pg Returns  | TypeScript Type | Conversion Needed |
| ---------------- | ----------- | --------------- | ----------------- |
| UUID             | string      | `string`        | None              |
| VARCHAR / TEXT   | string      | `string`        | None              |
| DECIMAL/NUMERIC  | string      | `string`        | `Number(row.col)` |
| INTEGER          | number      | `number`        | None              |
| BOOLEAN          | boolean     | `boolean`       | None              |
| DATE             | string      | `string`        | None (YYYY-MM-DD) |
| TIMESTAMP        | Date object | `Date`          | `.toISOString()`  |
| TIMESTAMP (null) | null        | `Date \| null`  | Ternary check     |

### Rules

- Row interfaces use snake_case to match database columns exactly
- DECIMAL columns are typed as `string` in Row interfaces (pg behavior)
- Optional JOIN columns use `?` suffix — they're only present when the JOIN is included
- Output interfaces use camelCase — the `toOutput()` method bridges the two
- Never use `any` for row types — always define the interface

## Date Handling

```typescript
// DATE columns (start_date, end_date, entry_date, assigned_date)
// pg returns as string "YYYY-MM-DD" — pass through directly
startDate: row.start_date,  // "2025-01-15"

// TIMESTAMP columns (created_at, updated_at)
// pg returns as Date object — convert to ISO string for API
createdAt: row.created_at.toISOString(),  // "2025-01-15T10:30:00.000Z"

// Month columns (actuals.month)
// Stored as VARCHAR "YYYY-MM" — pass through directly
month: row.month,  // "2025-01"

// Date range filtering — use parameterized dates
WHERE entry_date BETWEEN $1 AND $2  // Pass "2025-01-01" and "2025-01-31"

// Month filtering for actuals
WHERE month = $1  // Pass "2025-01"
WHERE month BETWEEN $1 AND $2  // Pass "2025-01" and "2025-06"
```

## Common Pitfalls

❌ **Don't:**

- Trust that DECIMAL columns return numbers (they return strings in pg)
- Use `SELECT *` in production queries (except with RETURNING)
- Build ORDER BY from user input without a whitelist
- Use `COUNT(*)` for existence checks (use `SELECT 1 LIMIT 1`)
- Forget `deleted_at IS NULL` on PROJECTS queries
- Use `!= null` instead of `!== undefined` in partial update builders
- Run external API calls inside database transactions
- Hardcode `$1, $2, $3` — use `paramIndex++` for dynamic queries

✅ **Do:**

- Convert DECIMAL with `Number()` in every `toOutput()` mapper
- Use `COALESCE(SUM(...), 0)` for aggregations
- Use `ILIKE` with `%search%` for text search
- Pre-aggregate in subqueries before JOINing to avoid cartesian products
- Use consistent table aliases across all repositories
- Define `SORT_COLUMNS` whitelist for every list endpoint
- Use `RETURNING *` on INSERT/UPDATE to avoid extra SELECT
- Wrap multi-table operations in `transaction()`
