# API Reference

Base URL: `https://[api-id].execute-api.us-east-1.amazonaws.com/prod`

All endpoints require authentication via Cognito JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

## Projects

### List Projects
```http
GET /api/projects?status=ACTIVE&page=1&pageSize=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Citizens Medical Center",
      "jobNumber": "23CON0002",
      "contractAmount": 15190000,
      "budgetedGpPct": 31.5,
      "burdenPct": 45.0,
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "status": "ACTIVE",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 95
  }
}
```

### Get Project
```http
GET /api/projects/{id}
```

### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "New Project",
  "jobNumber": "25CON0001",
  "contractAmount": 5000000,
  "budgetedGpPct": 30.0,
  "burdenPct": 45.0,
  "startDate": "2025-03-01",
  "endDate": "2026-02-28"
}
```

### Update Project
```http
PUT /api/projects/{id}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "status": "ON_HOLD"
}
```

### Delete Project
```http
DELETE /api/projects/{id}
```

### Get Project Summary
```http
GET /api/projects/{id}/summary
```

**Response:**
```json
{
  "data": {
    "project": { /* project object */ },
    "budgetSummary": {
      "totalBudget": 10405300,
      "laborBudget": 5500000,
      "materialBudget": 3500000,
      "equipmentBudget": 1405300
    },
    "actualsSummary": {
      "totalActuals": 8234560,
      "laborActuals": 4123456,
      "materialActuals": 2987654,
      "equipmentActuals": 1123450
    },
    "projectionSummary": {
      "projectedGp": 4784700,
      "projectedGpPct": 31.5,
      "variance": 0
    }
  }
}
```

## Budget

### List Budget Lines
```http
GET /api/projects/{projectId}/budget
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "costCodeId": "uuid",
      "costCode": {
        "code": "L-001",
        "description": "Project Manager",
        "type": "LABOR"
      },
      "description": "PM - Full project duration",
      "budgetedAmount": 250000,
      "budgetedQuantity": 2000,
      "budgetedUnitCost": 125.00,
      "notes": "",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Create Budget Line
```http
POST /api/projects/{projectId}/budget
Content-Type: application/json

{
  "costCodeId": "uuid",
  "description": "Superintendent",
  "budgetedAmount": 180000,
  "budgetedQuantity": 1500,
  "budgetedUnitCost": 120.00,
  "notes": "Full-time on site"
}
```

### Update Budget Line
```http
PUT /api/projects/{projectId}/budget/{lineId}
Content-Type: application/json

{
  "budgetedAmount": 200000,
  "notes": "Updated based on revised estimate"
}
```

### Delete Budget Line
```http
DELETE /api/projects/{projectId}/budget/{lineId}
```

## Employees

### List Project Employees
```http
GET /api/projects/{projectId}/employees?isActive=true
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "name": "John Smith",
      "laborRateId": "uuid",
      "laborRate": {
        "code": "PM",
        "description": "Project Manager",
        "hourlyRate": 125.00
      },
      "homeBranch": "Austin",
      "projectRole": "Project Manager",
      "assignedDate": "2025-01-01",
      "endDate": null,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Add Employee to Project
```http
POST /api/projects/{projectId}/employees
Content-Type: application/json

{
  "name": "Jane Doe",
  "laborRateId": "uuid",
  "homeBranch": "Dallas",
  "projectRole": "Superintendent",
  "assignedDate": "2025-02-01"
}
```

### Update Employee
```http
PUT /api/projects/{projectId}/employees/{id}
Content-Type: application/json

{
  "projectRole": "Senior Superintendent",
  "endDate": "2025-12-31"
}
```

### Remove Employee from Project
```http
DELETE /api/projects/{projectId}/employees/{id}
```

## Time Entries

### List Time Entries
```http
GET /api/projects/{projectId}/time-entries?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "employeeId": "uuid",
      "employee": {
        "name": "John Smith",
        "laborRate": { /* labor rate object */ }
      },
      "costCodeId": "uuid",
      "costCode": {
        "code": "L-001",
        "description": "Project Manager"
      },
      "entryDate": "2025-01-15",
      "hoursSt": 8.0,
      "hoursOt": 0.0,
      "hoursDt": 0.0,
      "source": "MANUAL",
      "notes": "",
      "createdAt": "2025-01-15T18:00:00Z"
    }
  ]
}
```

### Create Time Entry
```http
POST /api/projects/{projectId}/time-entries
Content-Type: application/json

{
  "employeeId": "uuid",
  "costCodeId": "uuid",
  "entryDate": "2025-01-15",
  "hoursSt": 8.0,
  "hoursOt": 2.0,
  "hoursDt": 0.0,
  "notes": "Worked on foundation"
}
```

### Update Time Entry
```http
PUT /api/time-entries/{id}
Content-Type: application/json

{
  "hoursSt": 7.5,
  "hoursOt": 2.5,
  "notes": "Corrected hours"
}
```

### Delete Time Entry
```http
DELETE /api/time-entries/{id}
```

### Query Time Entries by Date
```http
GET /api/time-entries?date=2025-01-15&projectId=uuid
```

## Actuals

### Get Monthly Actuals
```http
GET /api/projects/{projectId}/actuals?month=2025-01
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "costCodeId": "uuid",
      "costCode": {
        "code": "L-001",
        "description": "Project Manager",
        "type": "LABOR"
      },
      "month": "2025-01",
      "actualAmount": 25000,
      "actualQuantity": 200,
      "actualUnitCost": 125.00,
      "source": "MANUAL",
      "notes": "",
      "createdAt": "2025-02-01T00:00:00Z"
    }
  ]
}
```

### Create/Update Actuals
```http
POST /api/projects/{projectId}/actuals
Content-Type: application/json

{
  "costCodeId": "uuid",
  "month": "2025-01",
  "actualAmount": 25000,
  "actualQuantity": 200,
  "actualUnitCost": 125.00,
  "source": "MANUAL",
  "notes": "January actuals"
}
```

### Get Specific Month Actuals
```http
GET /api/projects/{projectId}/actuals/2025-01
```

## Projections

### List Projection Snapshots
```http
GET /api/projects/{projectId}/projections
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "snapshotDate": "2025-01-31",
      "snapshotName": "January 2025 Projection",
      "projectedGp": 4784700,
      "projectedGpPct": 31.5,
      "notes": "End of month projection",
      "createdBy": "uuid",
      "createdAt": "2025-01-31T23:59:59Z"
    }
  ]
}
```

### Create Projection Snapshot
```http
POST /api/projects/{projectId}/projections
Content-Type: application/json

{
  "snapshotName": "February 2025 Projection",
  "notes": "Mid-month projection update",
  "details": [
    {
      "costCodeId": "uuid",
      "projectedAmount": 275000,
      "projectedQuantity": 2200,
      "projectedUnitCost": 125.00,
      "notes": "Increased hours due to schedule acceleration"
    }
  ]
}
```

### Get Projection Snapshot
```http
GET /api/projects/{projectId}/projections/{snapshotId}
```

**Response:**
```json
{
  "data": {
    "snapshot": {
      "id": "uuid",
      "projectId": "uuid",
      "snapshotDate": "2025-01-31",
      "snapshotName": "January 2025 Projection",
      "projectedGp": 4784700,
      "projectedGpPct": 31.5,
      "notes": "",
      "createdBy": "uuid",
      "createdAt": "2025-01-31T23:59:59Z"
    },
    "details": [
      {
        "id": "uuid",
        "snapshotId": "uuid",
        "costCodeId": "uuid",
        "costCode": { /* cost code object */ },
        "projectedAmount": 250000,
        "projectedQuantity": 2000,
        "projectedUnitCost": 125.00,
        "notes": ""
      }
    ]
  }
}
```

### Update Projection Snapshot
```http
PUT /api/projects/{projectId}/projections/{snapshotId}
Content-Type: application/json

{
  "snapshotName": "January 2025 Projection (Revised)",
  "notes": "Updated with latest information"
}
```

### Delete Projection Snapshot
```http
DELETE /api/projects/{projectId}/projections/{snapshotId}
```

## Cost Codes

### List Cost Codes
```http
GET /api/cost-codes?type=LABOR
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "L-001",
      "description": "Project Manager",
      "type": "LABOR",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Cost Code
```http
GET /api/cost-codes/{id}
```

## Labor Rates

### List Labor Rates
```http
GET /api/labor-rates
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "PM",
      "description": "Project Manager",
      "hourlyRate": 125.00,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

## Error Responses

All error responses follow this format:

```json
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

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid auth token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_RESOURCE | 409 | Resource already exists |
| INVALID_STATE | 422 | Operation not allowed in current state |
| INTERNAL_ERROR | 500 | Server error |
| DATABASE_ERROR | 500 | Database operation failed |

## Rate Limiting

- Rate limit: 100 requests/second
- Burst limit: 200 requests
- Headers included in response:
  - `X-RateLimit-Limit`: Maximum requests per second
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [ /* items */ ],
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

## Filtering & Sorting

**Filtering:**
```http
GET /api/projects?status=ACTIVE&search=medical
```

**Sorting:**
```http
GET /api/projects?sort=name&order=asc
```

Multiple fields:
```http
GET /api/projects?sort=status,name&order=asc,desc
```
