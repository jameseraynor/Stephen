---
inclusion: auto
---

# Backend Architecture Conventions

This document defines the architecture patterns, coding standards, and conventions for all Lambda backend code. Every handler, service, and repository must follow these rules.

## Architecture Pattern: Handler → Service → Repository

Inspired by Spring MVC's Controller → Service → Repository, adapted for serverless Lambda.

### Layer Responsibilities

| Layer      | File Pattern             | Responsibility                                                | Can Call                            |
| ---------- | ------------------------ | ------------------------------------------------------------- | ----------------------------------- |
| Handler    | `{action}.ts`            | HTTP concerns: parse request, validate input, format response | Service only                        |
| Service    | `{domain}.service.ts`    | Business logic, orchestration, authorization rules            | Repository, other Services          |
| Repository | `{domain}.repository.ts` | SQL queries, data mapping, database transactions              | `shared/db.ts` only (via RDS Proxy) |

### What Each Layer Must NOT Do

- **Handler**: Must NOT contain SQL queries, business calculations, or direct DB calls
- **Service**: Must NOT reference `APIGatewayProxyEvent`, HTTP status codes, or format responses
- **Repository**: Must NOT contain business logic, validation rules, or call other repositories directly

## Folder Structure

```
backend/src/
├── functions/
│   ├── projects/
│   │   ├── create.ts                  # Handler
│   │   ├── get.ts                     # Handler
│   │   ├── list.ts                    # Handler
│   │   ├── update.ts                  # Handler
│   │   ├── delete.ts                  # Handler
│   │   ├── projects.service.ts        # Business logic
│   │   └── projects.repository.ts     # SQL queries
│   ├── budget/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   ├── budget.service.ts
│   │   └── budget.repository.ts
│   ├── employees/
│   │   ├── ...handlers...
│   │   ├── employees.service.ts
│   │   └── employees.repository.ts
│   ├── time-entries/
│   │   ├── ...handlers...
│   │   ├── time-entries.service.ts
│   │   └── time-entries.repository.ts
│   ├── actuals/
│   │   ├── ...handlers...
│   │   ├── actuals.service.ts
│   │   └── actuals.repository.ts
│   ├── projections/
│   │   ├── ...handlers...
│   │   ├── projections.service.ts
│   │   └── projections.repository.ts
│   └── cost-codes/
│       ├── ...handlers...
│       ├── cost-codes.service.ts
│       └── cost-codes.repository.ts
├── shared/
│   ├── auth.ts            # Authentication & authorization utilities
│   ├── db.ts              # Database client (single connection via RDS Proxy)
│   ├── logger.ts          # AWS Lambda Powertools Logger (structured JSON)
│   ├── response.ts        # HTTP response formatting & ApiError class
│   ├── secrets.ts         # AWS Secrets Manager with caching
│   └── validation.ts      # Zod schema validation utilities
└── types/
    └── index.ts           # All Zod schemas & TypeScript types
```

## Handler Pattern (Controller equivalent)

Handlers are the entry point for each Lambda function. They handle HTTP concerns only.

```typescript
// functions/projects/create.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent, requireRole } from "../../shared/auth";
import { validateBody } from "../../shared/validation";
import { successResponse, errorResponse } from "../../shared/response";
import { logger } from "../../shared/logger";
import { ProjectsService } from "./projects.service";
import { CreateProjectSchema } from "../../types";

const service = new ProjectsService();

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logger.setContext({ requestId });
    logger.info("Creating project", {
      path: event.path,
      method: event.httpMethod,
    });

    // 1. Authentication
    const user = getUserFromEvent(event);
    logger.setContext({ userId: user.userId });

    // 2. Authorization
    requireRole(user, "Admin");

    // 3. Validation
    const body = validateBody(
      CreateProjectSchema,
      JSON.parse(event.body || "{}"),
    );

    // 4. Delegate to service
    const project = await service.create(body, user.userId);

    // 5. Return response
    return successResponse(project, 201);
  } catch (error) {
    logger.error("Error creating project", error);
    return errorResponse(error, requestId);
  } finally {
    logger.clearContext();
  }
}
```

### Handler Rules

1. Every handler follows the same 5-step flow: Auth → Authorization → Validation → Service call → Response
2. The `try/catch/finally` block is mandatory with `logger.clearContext()` in finally
3. Handlers must set `requestId` and `userId` in logger context
4. Handlers must NOT instantiate repositories directly — only services
5. One handler per file, one file per endpoint

## Service Pattern (Service equivalent)

Services contain all business logic. They are classes with methods that operate on validated data.

```typescript
// functions/projects/projects.service.ts
import { AuthUser } from "../../shared/auth";
import { ApiError } from "../../shared/response";
import { logger } from "../../shared/logger";
import { ProjectsRepository } from "./projects.repository";

export class ProjectsService {
  private repository: ProjectsRepository;

  constructor() {
    this.repository = new ProjectsRepository();
  }

  async create(
    data: CreateProjectInput,
    userId: string,
  ): Promise<ProjectOutput> {
    logger.info("Creating project", { jobNumber: data.jobNumber });

    // Business rule: check for duplicate job number
    const existing = await this.repository.findByJobNumber(data.jobNumber);
    if (existing) {
      throw new ApiError(
        "DUPLICATE_RESOURCE",
        "Job number already exists",
        409,
      );
    }

    // Delegate to repository
    const project = await this.repository.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });

    logger.info("Project created", { id: project.id });
    return project;
  }
}
```

### Service Rules

1. Services are classes (not plain functions) to allow dependency injection and testing
2. Services receive already-validated data — no raw HTTP objects
3. Services throw `ApiError` for business rule violations
4. Services can call their own repository and other services (for cross-domain operations)
5. Services must NOT import anything from `aws-lambda` types
6. All business calculations and rules live here

## Repository Pattern (Repository equivalent)

Repositories handle all database interactions. They map between camelCase (API) and snake_case (database).

```typescript
// functions/projects/projects.repository.ts
import { query, transaction } from "../../shared/db";
import { logger } from "../../shared/logger";

interface ProjectRow {
  id: string;
  name: string;
  job_number: string;
  contract_amount: number;
  budgeted_gp_pct: number;
  burden_pct: number | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export class ProjectsRepository {
  async findById(id: string): Promise<ProjectOutput | null> {
    const sql = `
      SELECT id, name, job_number, contract_amount, budgeted_gp_pct,
             burden_pct, start_date, end_date, status,
             created_at, updated_at
      FROM PROJECTS
      WHERE id = $1
    `;
    const result = await query<ProjectRow>(sql, [id]);
    return result.rows.length > 0 ? this.toOutput(result.rows[0]) : null;
  }

  async findByJobNumber(jobNumber: string): Promise<ProjectOutput | null> {
    const sql = `SELECT id, name, job_number FROM PROJECTS WHERE job_number = $1`;
    const result = await query<ProjectRow>(sql, [jobNumber]);
    return result.rows.length > 0 ? this.toOutput(result.rows[0]) : null;
  }

  async create(data: CreateProjectDb): Promise<ProjectOutput> {
    const sql = `
      INSERT INTO PROJECTS (name, job_number, contract_amount, budgeted_gp_pct,
                            burden_pct, start_date, end_date, status, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      data.name,
      data.jobNumber,
      data.contractAmount,
      data.budgetedGpPct,
      data.burdenPct || null,
      data.startDate,
      data.endDate,
      data.status,
      data.createdBy,
      data.updatedBy,
    ];
    const result = await query<ProjectRow>(sql, params);
    return this.toOutput(result.rows[0]);
  }

  // Maps snake_case DB row → camelCase output
  private toOutput(row: ProjectRow): ProjectOutput {
    return {
      id: row.id,
      name: row.name,
      jobNumber: row.job_number,
      contractAmount: Number(row.contract_amount),
      budgetedGpPct: Number(row.budgeted_gp_pct),
      burdenPct: row.burden_pct ? Number(row.burden_pct) : undefined,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
```

### Repository Rules

1. Repositories are classes with methods per query operation
2. Every repository has a private `toOutput()` method that maps snake_case → camelCase
3. Repositories define a `Row` interface for the raw database result type
4. SQL uses parameterized queries ($1, $2...) — NEVER string concatenation
5. Repositories must NOT throw `ApiError` — they throw database errors only
6. Use `transaction()` from `shared/db.ts` for multi-table operations
7. SELECT queries must list columns explicitly — never use `SELECT *` in production (RETURNING \* is acceptable for INSERT/UPDATE)

## Naming Conventions

### Files

```
handlers:     create.ts, get.ts, list.ts, update.ts, delete.ts
services:     {domain}.service.ts     (e.g., projects.service.ts)
repositories: {domain}.repository.ts  (e.g., projects.repository.ts)
```

### Classes

```
Services:     {Domain}Service         (e.g., ProjectsService)
Repositories: {Domain}Repository      (e.g., ProjectsRepository)
```

### Functions

```
handlers:     handler (always named "handler" — it's the Lambda entry point)
service:      create, getById, list, update, delete, calculateGp, etc.
repository:   findById, findAll, findByJobNumber, create, update, delete, count
```

### Types

```
Input types:   Create{Domain}Input, Update{Domain}Input   (camelCase, API layer)
Output types:  {Domain}Output                              (camelCase, API response)
DB types:      {Domain}Row                                 (snake_case, database row)
DB input:      Create{Domain}Db                            (snake_case, for INSERT)
```

### Variables

```
camelCase for all variables and function parameters
UPPER_SNAKE_CASE for constants and environment variables
PascalCase for classes, interfaces, types, and Zod schemas
```

## Error Handling

### Error Hierarchy

| Error Type                            | HTTP Code | When to Use                       |
| ------------------------------------- | --------- | --------------------------------- |
| `ApiError('VALIDATION_ERROR', ...)`   | 400       | Invalid input data                |
| `ApiError('UNAUTHORIZED', ...)`       | 401       | Missing or invalid auth token     |
| `ApiError('FORBIDDEN', ...)`          | 403       | Valid token but insufficient role |
| `ApiError('NOT_FOUND', ...)`          | 404       | Resource doesn't exist            |
| `ApiError('DUPLICATE_RESOURCE', ...)` | 409       | Unique constraint violation       |
| `ApiError('INVALID_STATE', ...)`      | 422       | Business rule violation           |
| `ApiError('INTERNAL_ERROR', ...)`     | 500       | Unexpected server error           |

### Where Errors Are Thrown

- **Handlers**: Only catch errors and delegate to `errorResponse()`
- **Services**: Throw `ApiError` for business rule violations
- **Repositories**: Let database errors bubble up (handler catches them)
- **Validation**: `validateBody()` / `validateQuery()` throw `ApiError` automatically

### Error Response Format (standard for all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": { "jobNumber": "Invalid format" },
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "abc-123"
  }
}
```

## Type System

### Zod Schemas as Single Source of Truth

All types are defined as Zod schemas in `types/index.ts`. TypeScript types are inferred from them.

```typescript
// types/index.ts

// API Input schema (camelCase — what the client sends)
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  jobNumber: z.string().regex(/^\d{2}[A-Z]{3}\d{4}$/),
  contractAmount: z.number().positive(),
  budgetedGpPct: z.number().min(0).max(100),
  burdenPct: z.number().min(0).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z
    .enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"])
    .default("ACTIVE"),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
```

### Naming Convention for Schemas

```
Create{Domain}Schema  → API input for POST
Update{Domain}Schema  → API input for PUT/PATCH
{Domain}OutputSchema  → API response shape (optional, for documentation)
```

## SQL Conventions

- Table names: UPPER_CASE (`PROJECTS`, `BUDGET_LINES`)
- Column names: snake_case (`job_number`, `contract_amount`)
- Use column aliases in SELECT to map to camelCase: `job_number as "jobNumber"`
- Parameterized queries only: `$1, $2, $3` — never string interpolation
- Always specify column list in SELECT (no `SELECT *` in production queries)
- Use `RETURNING *` only for INSERT/UPDATE to get the created/updated row
- Wrap multi-table operations in `transaction()`

## Logging Standards

Uses AWS Lambda Powertools Logger for structured JSON output to CloudWatch.

```typescript
// Logger is instantiated once at module level (outside handler)
import { logger } from "../../shared/logger";

// In handlers: append request-scoped keys
logger.appendKeys({ requestId, userId });

// Log at appropriate levels
logger.info("Creating project", { jobNumber: body.jobNumber }); // Key operations
logger.debug("Query parameters", { params }); // Development detail
logger.warn("Project not found", { id }); // Expected but notable
logger.error("Error creating project", error as Error); // Failures

// Reset keys at end of handler (in finally block)
logger.resetKeys();

// NEVER log sensitive data
// ❌ logger.info('User credentials', { password, token });
// ❌ logger.info('Full request body', event.body);
// ✅ logger.info('Creating project', { jobNumber: body.jobNumber });
```

### Powertools Environment Variables (set in Lambda config)

```
POWERTOOLS_SERVICE_NAME=cost-control-api
POWERTOOLS_LOG_LEVEL=INFO          # DEBUG in dev, INFO in prod
POWERTOOLS_LOGGER_SAMPLE_RATE=0.1  # 10% of invocations log at DEBUG level
```

## Response Format

### Success (single resource)

```json
{ "data": { "id": "123", "name": "Project A", ... } }
```

### Success (collection with pagination)

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 95,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Success (delete)

```json
{ "data": null, "message": "Project deleted successfully" }
```

## Import Order

Maintain consistent import ordering in all files:

```typescript
// 1. AWS/Node built-in modules
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// 2. Third-party libraries
import { z } from "zod";

// 3. Shared modules
import { getUserFromEvent, requireRole } from "../../shared/auth";
import { validateBody } from "../../shared/validation";
import { successResponse, errorResponse } from "../../shared/response";
import { logger } from "../../shared/logger";

// 4. Local modules (service, repository, types)
import { ProjectsService } from "./projects.service";
import { CreateProjectSchema } from "../../types";
```

## Testing Conventions

- Test files live next to the source: `projects.service.test.ts`
- Mock the repository when testing services
- Mock the service when testing handlers
- Never mock `shared/` utilities — test them separately
- Use factory functions for test data (see testing-guidelines.md)

## Common Pitfalls

❌ **Don't:**

- Put SQL in handlers
- Put HTTP logic in services
- Use `any` type — always define interfaces
- Hardcode credentials or secrets
- Use `console.log` — use `logger` instead
- Return raw database rows without mapping to camelCase
- Forget to release database connections (use `query()` helper, not raw pool)

✅ **Do:**

- Follow Handler → Service → Repository strictly
- Use `ApiError` for all expected errors
- Map snake_case ↔ camelCase at the repository boundary
- Use Zod schemas for all input validation
- Log with structured context (requestId, userId)
- Use parameterized SQL queries
- Keep handlers thin — 5 steps max
