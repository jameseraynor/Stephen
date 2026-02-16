---
inclusion: always
---

# API Design Standards

This document defines REST API design patterns and conventions for the backend Lambda functions.

## URL Structure

### Base Pattern
```
/api/{resource}/{id?}/{sub-resource?}
```

### Resource Naming
- Use plural nouns for collections
- Use kebab-case for multi-word resources
- Keep URLs lowercase

```
✅ Good:
GET    /api/projects
GET    /api/projects/123
GET    /api/projects/123/budget
POST   /api/daily-time-entries
GET    /api/cost-codes

❌ Bad:
GET    /api/getProjects
GET    /api/Project/123
POST   /api/createTimeEntry
GET    /api/costCodes
```

## HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve resource(s) | `GET /api/projects` |
| POST | Create new resource | `POST /api/projects` |
| PUT | Update entire resource | `PUT /api/projects/123` |
| PATCH | Partial update | `PATCH /api/projects/123` |
| DELETE | Remove resource | `DELETE /api/projects/123` |

## Endpoint Definitions

### Projects
```
GET    /api/projects                    # List all projects
GET    /api/projects/{id}               # Get project details
POST   /api/projects                    # Create project
PUT    /api/projects/{id}               # Update project
DELETE /api/projects/{id}               # Delete project
GET    /api/projects/{id}/summary       # Get project summary
```

### Budget
```
GET    /api/projects/{projectId}/budget              # Get budget lines
POST   /api/projects/{projectId}/budget              # Create budget line
PUT    /api/projects/{projectId}/budget/{lineId}    # Update budget line
DELETE /api/projects/{projectId}/budget/{lineId}    # Delete budget line
```

### Employees
```
GET    /api/projects/{projectId}/employees           # List employees
POST   /api/projects/{projectId}/employees           # Add employee
PUT    /api/projects/{projectId}/employees/{id}     # Update employee
DELETE /api/projects/{projectId}/employees/{id}     # Remove employee
```

### Time Entries
```
GET    /api/projects/{projectId}/time-entries        # List time entries
POST   /api/projects/{projectId}/time-entries        # Create time entry
PUT    /api/time-entries/{id}                        # Update time entry
DELETE /api/time-entries/{id}                        # Delete time entry
GET    /api/time-entries?date=2025-01-15            # Query by date
```

### Actuals
```
GET    /api/projects/{projectId}/actuals             # Get monthly actuals
POST   /api/projects/{projectId}/actuals             # Create/update actuals
GET    /api/projects/{projectId}/actuals/{month}    # Get specific month
```

### Projections
```
GET    /api/projects/{projectId}/projections                    # List snapshots
POST   /api/projects/{projectId}/projections                    # Create snapshot
GET    /api/projects/{projectId}/projections/{snapshotId}      # Get snapshot
PUT    /api/projects/{projectId}/projections/{snapshotId}      # Update snapshot
DELETE /api/projects/{projectId}/projections/{snapshotId}      # Delete snapshot
```

### Reference Data
```
GET    /api/cost-codes                   # List all cost codes
GET    /api/cost-codes/{id}              # Get cost code details
GET    /api/labor-rates                  # List labor rates
GET    /api/equipment-catalog            # List equipment
```

## Request Format

### POST/PUT Body
```typescript
// ✅ Good - camelCase JSON
POST /api/projects
{
  "name": "Citizens Medical Center",
  "jobNumber": "23CON0002",
  "contractAmount": 15190000,
  "budgetedGpPct": 31.5,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}

// ❌ Bad - snake_case or inconsistent
{
  "project_name": "...",
  "JobNumber": "...",
  "contract_amt": 15190000
}
```

### Query Parameters
```
✅ Good:
GET /api/projects?status=active&sort=name&order=asc
GET /api/time-entries?startDate=2025-01-01&endDate=2025-01-31
GET /api/actuals?projectId=123&month=2025-01

❌ Bad:
GET /api/projects?Status=Active&SortBy=Name
GET /api/time-entries?start_date=2025-01-01
```

## Response Format

### Success Response
```typescript
// Single resource
{
  "data": {
    "id": "123",
    "name": "Citizens Medical Center",
    "jobNumber": "23CON0002",
    "contractAmount": 15190000,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}

// Collection
{
  "data": [
    { "id": "1", "name": "Project A" },
    { "id": "2", "name": "Project B" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 95
  }
}

// No content
{
  "data": null,
  "message": "Project deleted successfully"
}
```

### Error Response
```typescript
// Standard error format
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "contractAmount": "Must be a positive number",
      "startDate": "Required field"
    },
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "abc-123-def"
  }
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or constraint violation |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary outage |

## Error Codes

```typescript
// Standard error codes
enum ErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  INVALID_STATE = 'INVALID_STATE',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

## Pagination

```typescript
// Query parameters
GET /api/projects?page=2&pageSize=20&sort=name&order=desc

// Response
{
  "data": [...],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 95,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

## Filtering

```typescript
// Simple filters
GET /api/projects?status=active
GET /api/time-entries?employeeId=123

// Date ranges
GET /api/actuals?startDate=2025-01-01&endDate=2025-01-31

// Multiple values
GET /api/cost-codes?type=L,M,E

// Search
GET /api/projects?search=medical
```

## Sorting

```typescript
// Single field
GET /api/projects?sort=name&order=asc

// Multiple fields
GET /api/projects?sort=status,name&order=asc,desc
```

## Lambda Handler Pattern

```typescript
// lambda/projects/list.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDbClient } from '../shared/db';
import { ApiResponse, ApiError } from '../shared/types';

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    // Extract user from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims.sub;
    
    // Parse query parameters
    const { status, page = '1', pageSize = '20' } = event.queryStringParameters || {};
    
    // Database query
    const db = await getDbClient();
    const projects = await db.query(
      'SELECT * FROM projects WHERE status = $1 LIMIT $2 OFFSET $3',
      [status, parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize)]
    );
    
    // Success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        data: projects.rows,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalItems: projects.rowCount
        }
      })
    };
  } catch (error) {
    console.error('Error listing projects:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list projects',
          timestamp: new Date().toISOString()
        }
      })
    };
  }
}
```

## Validation

```typescript
// lambda/shared/validation.ts
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  jobNumber: z.string().regex(/^\d{2}[A-Z]{3}\d{4}$/),
  contractAmount: z.number().positive(),
  budgetedGpPct: z.number().min(0).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.errors.reduce((acc, err) => ({
          ...acc,
          [err.path.join('.')]: err.message
        }), {})
      };
    }
    throw error;
  }
}
```

## Authentication

```typescript
// All endpoints require Cognito JWT token
// Token is validated by API Gateway Cognito Authorizer
// User info available in event.requestContext.authorizer.claims

interface CognitoClaims {
  sub: string;              // User ID
  email: string;
  'cognito:groups': string[]; // User roles
}

// Access user info in Lambda
const userId = event.requestContext.authorizer?.claims.sub;
const userEmail = event.requestContext.authorizer?.claims.email;
const userRoles = event.requestContext.authorizer?.claims['cognito:groups'] || [];
```

## Rate Limiting

```typescript
// Configured in API Gateway
// Default: 100 requests/second, burst 200
// Per-user limits enforced by Cognito

// Response headers
{
  "X-RateLimit-Limit": "100",
  "X-RateLimit-Remaining": "95",
  "X-RateLimit-Reset": "1640000000"
}
```

## Versioning

```
// For future API versions
/api/v1/projects
/api/v2/projects

// MVP uses unversioned /api/ (implicit v1)
```

## Common Pitfalls

❌ **Don't:**
- Use verbs in URLs (`/getProjects`)
- Return different structures for same endpoint
- Expose internal IDs or implementation details
- Return 200 for errors
- Use inconsistent naming (camelCase vs snake_case)

✅ **Do:**
- Use nouns for resources
- Return consistent response structure
- Use appropriate HTTP status codes
- Include request IDs for debugging
- Document all endpoints
