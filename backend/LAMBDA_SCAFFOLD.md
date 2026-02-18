# Lambda Functions Scaffold

Complete infrastructure for Lambda function handlers with shared utilities.

## ✅ Completed

### 1. Shared Utilities

#### Database Client (`src/shared/db.ts`)

- PostgreSQL client connecting through AWS RDS Proxy
- RDS Proxy handles connection pooling centrally across all Lambda invocations
- Single `pg.Client` per Lambda container (reused across invocations)
- Transaction support
- Automatic secret retrieval from Secrets Manager
- Error handling and automatic reconnection

#### Secrets Manager (`src/shared/secrets.ts`)

- Retrieve secrets from AWS Secrets Manager
- In-memory caching for performance
- Type-safe secret retrieval

#### Authentication (`src/shared/auth.ts`)

- Extract user from Cognito JWT tokens
- Role-based access control (Admin, ProjectManager, Viewer)
- Permission checking utilities
- Group membership validation

#### Validation (`src/shared/validation.ts`)

- Request body validation with Zod
- Query parameter validation
- Path parameter validation
- Common validation schemas (UUID, pagination, date ranges)
- Detailed error messages

#### Response Utilities (`src/shared/response.ts`)

- Standard response formatting
- Success responses with pagination
- Error responses with details
- HTTP status code helpers
- CORS headers

#### Logger (`src/shared/logger.ts`)

- AWS Lambda Powertools Logger for structured JSON output
- Automatic Lambda context injection (function name, memory, cold start)
- Log levels via `POWERTOOLS_LOG_LEVEL` env var (DEBUG, INFO, WARN, ERROR)
- Request-scoped keys via `appendKeys()` / `resetKeys()`
- Log sampling for production debugging via `POWERTOOLS_LOGGER_SAMPLE_RATE`
- CloudWatch Logs integration with EMF support

### 2. Handler Template

#### Template File (`src/shared/handler-template.ts`)

- Standard Lambda handler structure
- Authentication
- Authorization
- Validation
- Error handling
- Logging

### 3. Example Handlers

#### List Projects (`src/functions/projects/list.ts`)

- GET /projects
- Pagination support
- Filtering by status
- Search by name/job number
- Sorting

#### Get Project (`src/functions/projects/get.ts`)

- GET /projects/{id}
- UUID validation
- Not found handling

#### Create Project (`src/functions/projects/create.ts`)

- POST /projects
- Request validation
- Role-based authorization
- Database insertion

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│  Cognito Authorizer validates JWT token                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Lambda Handler                              │
│  1. Extract user from event                                  │
│  2. Check authorization                                      │
│  3. Validate request                                         │
│  4. Execute business logic                                   │
│  5. Return response                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Shared Utilities                            │
│  auth, validation, response, logger, db                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  Aurora PostgreSQL, Secrets Manager                         │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Basic Handler

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserFromEvent } from "../../shared/auth";
import { successResponse, errorResponse } from "../../shared/response";
import { logger } from "../../shared/logger";
import { query } from "../../shared/db";

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logger.appendKeys({ requestId });
    logger.info("Processing request");

    const user = getUserFromEvent(event);
    logger.appendKeys({ userId: user.userId });

    // Business logic
    const result = await query("SELECT * FROM table");

    return successResponse(result.rows);
  } catch (error) {
    logger.error("Error", error as Error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}
```

### Handler with Validation

```typescript
import {
  validateBody,
  validatePathParam,
  commonSchemas,
} from "../../shared/validation";
import { z } from "zod";

const RequestSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
});

export async function handler(event: APIGatewayProxyEvent) {
  try {
    // Validate path parameter
    const id = validatePathParam(
      "id",
      event.pathParameters?.id,
      commonSchemas.uuid,
    );

    // Validate body
    const body = validateBody(RequestSchema, JSON.parse(event.body || "{}"));

    // Use validated data
    await query("INSERT INTO table (id, name, amount) VALUES ($1, $2, $3)", [
      id,
      body.name,
      body.amount,
    ]);

    return successResponse({ message: "Created" }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
```

### Handler with Authorization

```typescript
import { getUserFromEvent, requireRole } from "../../shared/auth";

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const user = getUserFromEvent(event);

    // Require Admin role
    requireRole(user, "Admin");

    // Only admins can reach this point
    // ...

    return successResponse({ message: "Success" });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### Handler with Transaction

```typescript
import { transaction } from '../../shared/db';

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const result = await transaction(async (client) => {
      // Insert project
      const projectResult = await client.query(
        'INSERT INTO PROJECTS (...) VALUES (...) RETURNING id',
        [...]
      );
      const projectId = projectResult.rows[0].id;

      // Insert budget lines
      for (const line of budgetLines) {
        await client.query(
          'INSERT INTO BUDGET_LINES (...) VALUES (...)',
          [projectId, ...]
        );
      }

      return projectId;
    });

    return successResponse({ id: result });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### Handler with Pagination

```typescript
import { validateQuery, commonSchemas } from "../../shared/validation";

const QuerySchema = commonSchemas.pagination.extend({
  status: z.string().optional(),
});

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const params = validateQuery(
      QuerySchema,
      event.queryStringParameters || {},
    );

    // Count total
    const countResult = await query("SELECT COUNT(*) as total FROM table");
    const totalItems = parseInt(countResult.rows[0].total, 10);

    // Get page
    const offset = (params.page - 1) * params.pageSize;
    const result = await query("SELECT * FROM table LIMIT $1 OFFSET $2", [
      params.pageSize,
      offset,
    ]);

    const totalPages = Math.ceil(totalItems / params.pageSize);

    return successResponse(result.rows, 200, {
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      totalItems,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
```

## Error Handling

All errors are automatically handled by the `errorResponse` utility:

### Validation Errors (400)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "name": "Name is required",
      "amount": "Amount must be positive"
    },
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "abc-123"
  }
}
```

### Authorization Errors (403)

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions. Required role: Admin, User role: Viewer",
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "abc-123"
  }
}
```

### Not Found Errors (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found",
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "abc-123"
  }
}
```

### Internal Errors (500)

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Database connection failed",
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "abc-123"
  }
}
```

## Logging

All logs are structured JSON via AWS Lambda Powertools Logger, sent to CloudWatch Logs:

```json
{
  "level": "INFO",
  "message": "Processing request",
  "service": "cost-control-api",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "xray_trace_id": "1-abc-def",
  "function_name": "cost-control-prod-projects-list",
  "function_memory_size": 512,
  "cold_start": false,
  "requestId": "abc-123",
  "userId": "user-456"
}
```

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about request processing
- **WARN**: Warning messages
- **ERROR**: Error messages with stack traces

Set log level via environment variable:

```bash
POWERTOOLS_LOG_LEVEL=INFO  # DEBUG, INFO, WARN, ERROR
```

## Environment Variables

Required for all Lambda functions:

```bash
# Database
DATABASE_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:db-credentials
RDS_PROXY_ENDPOINT=cost-control-prod-db-proxy.proxy-xxx.us-east-1.rds.amazonaws.com

# AWS Lambda Powertools
POWERTOOLS_SERVICE_NAME=cost-control-api
POWERTOOLS_LOG_LEVEL=INFO
POWERTOOLS_LOGGER_SAMPLE_RATE=0.1
POWERTOOLS_METRICS_NAMESPACE=CostControl

# AWS
AWS_REGION=us-east-1
```

## Next Steps

### Create Remaining Handlers

1. **Projects**
   - ✅ list.ts
   - ✅ get.ts
   - ✅ create.ts
   - ⏳ update.ts
   - ⏳ delete.ts
   - ⏳ summary.ts

2. **Budget Lines**
   - list.ts (GET /projects/{projectId}/budget)
   - create.ts (POST /projects/{projectId}/budget)
   - update.ts (PUT /projects/{projectId}/budget/{lineId})
   - delete.ts (DELETE /projects/{projectId}/budget/{lineId})

3. **Employees**
   - list.ts
   - create.ts
   - update.ts
   - delete.ts

4. **Time Entries**
   - list.ts
   - create.ts
   - update.ts
   - delete.ts

5. **Actuals**
   - list.ts
   - create.ts
   - update.ts

6. **Projections**
   - list.ts
   - get.ts
   - create.ts
   - update.ts
   - delete.ts

7. **Reference Data**
   - cost-codes/list.ts
   - labor-rates/list.ts

### Testing

Write unit tests for:

- Shared utilities
- Handler logic
- Database queries
- Validation schemas

### CDK Integration

Update CDK stacks to:

- Create Lambda functions
- Configure environment variables
- Set up API Gateway routes
- Configure IAM permissions

## Benefits

✅ **Consistent Pattern**: All handlers follow the same structure
✅ **Type Safety**: Full TypeScript support
✅ **Error Handling**: Centralized error handling
✅ **Logging**: AWS Lambda Powertools structured logging
✅ **Authentication**: Automatic user extraction
✅ **Authorization**: Role-based access control
✅ **Validation**: Request validation with Zod
✅ **Database**: RDS Proxy connection management and transactions
✅ **Maintainability**: Shared utilities reduce duplication
✅ **Testability**: Easy to mock and test
