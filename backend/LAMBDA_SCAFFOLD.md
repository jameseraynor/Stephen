# Lambda Functions Scaffold

Complete infrastructure for Lambda function handlers with shared utilities.

## ✅ Completed

### 1. Shared Utilities

#### Database Client (`src/shared/db.ts`)

- PostgreSQL connection pool optimized for Lambda
- Connection reuse across invocations
- Transaction support
- Automatic secret retrieval from Secrets Manager
- Error handling and pool management

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

- Structured JSON logging
- Log levels (DEBUG, INFO, WARN, ERROR)
- Context management (requestId, userId)
- CloudWatch Logs integration

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
    logger.setContext({ requestId });
    logger.info("Processing request");

    const user = getUserFromEvent(event);
    logger.setContext({ userId: user.userId });

    // Business logic
    const result = await query("SELECT * FROM table");

    return successResponse(result.rows);
  } catch (error) {
    logger.error("Error", error);
    return errorResponse(error, requestId);
  } finally {
    logger.clearContext();
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

All logs are structured JSON sent to CloudWatch Logs:

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "INFO",
  "message": "Processing request",
  "requestId": "abc-123",
  "userId": "user-456",
  "data": {
    "path": "/projects",
    "method": "GET"
  }
}
```

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about request processing
- **WARN**: Warning messages
- **ERROR**: Error messages with stack traces

Set log level via environment variable:

```bash
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARN, ERROR
```

## Environment Variables

Required for all Lambda functions:

```bash
# Database
DATABASE_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:db-credentials

# Logging
LOG_LEVEL=INFO

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
✅ **Logging**: Structured logging for CloudWatch
✅ **Authentication**: Automatic user extraction
✅ **Authorization**: Role-based access control
✅ **Validation**: Request validation with Zod
✅ **Database**: Connection pooling and transactions
✅ **Maintainability**: Shared utilities reduce duplication
✅ **Testability**: Easy to mock and test
