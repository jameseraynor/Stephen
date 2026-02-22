---
inclusion: fileMatch
fileMatchPattern: "backend/src/functions/**"
---

# Lambda Service Map

This document defines the exact Lambda functions for the MVP. **Do NOT create Lambda functions beyond what is listed here.**

## Strategy: Domain-Grouped Lambdas

Each domain gets ONE Lambda with internal routing by HTTP method + path. This keeps the total count low (8 Lambdas) while maintaining clean separation of concerns.

## Definitive Lambda Map

| #   | Lambda Name     | File                                | Routes Handled                                                                        | Methods                |
| --- | --------------- | ----------------------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| 1   | projects        | `functions/projects/index.ts`       | `/projects`, `/projects/{id}`                                                         | GET, POST, PUT, DELETE |
| 2   | project-summary | `functions/projects/summary.ts`     | `/projects/{id}/summary`                                                              | GET                    |
| 3   | budget          | `functions/budget/index.ts`         | `/projects/{projectId}/budget`, `/projects/{projectId}/budget/{lineId}`               | GET, POST, PUT, DELETE |
| 4   | employees       | `functions/employees/index.ts`      | `/projects/{projectId}/employees`, `/projects/{projectId}/employees/{id}`             | GET, POST, PUT, DELETE |
| 5   | time-entries    | `functions/time-entries/index.ts`   | `/projects/{projectId}/time-entries`, `/time-entries/{id}`, `/time-entries`           | GET, POST, PUT, DELETE |
| 6   | actuals         | `functions/actuals/index.ts`        | `/projects/{projectId}/actuals`, `/projects/{projectId}/actuals/{month}`              | GET, POST              |
| 7   | projections     | `functions/projections/index.ts`    | `/projects/{projectId}/projections`, `/projects/{projectId}/projections/{snapshotId}` | GET, POST, PUT, DELETE |
| 8   | reference-data  | `functions/reference-data/index.ts` | `/cost-codes`, `/cost-codes/{id}`, `/labor-rates`                                     | GET                    |

**Total: 8 Lambdas for ~30 endpoints**

## Why NOT 1-Lambda-per-endpoint

- 30 Lambdas = 30 CloudWatch log groups, 30 IAM roles, 30 CDK constructs
- Cold start multiplied across rarely-hit endpoints
- Deployment time increases linearly with Lambda count
- Harder to share in-memory caches (DB connections, secrets)

## Why NOT 1 monolith Lambda

- Single Lambda handling all routes gets bloated fast
- Bundle size affects cold start
- Can't set different memory/timeout per domain
- A bug in one domain takes down everything

## Internal Routing Pattern

Each domain Lambda uses a simple router:

```typescript
// functions/budget/index.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const lineId = event.pathParameters?.lineId;

  switch (method) {
    case "GET":
      return listBudgetLines(event);
    case "POST":
      return createBudgetLine(event);
    case "PUT":
      if (!lineId) return errorResponse("lineId required", 400);
      return updateBudgetLine(event, lineId);
    case "DELETE":
      if (!lineId) return errorResponse("lineId required", 400);
      return deleteBudgetLine(event, lineId);
    default:
      return errorResponse("Method not allowed", 405);
  }
}
```

## File Structure Per Domain

```
functions/
├── projects/
│   ├── index.ts          # Router + CRUD handlers
│   └── summary.ts        # Separate: complex aggregation query
├── budget/
│   └── index.ts          # Router + CRUD handlers
├── employees/
│   └── index.ts          # Router + CRUD handlers
├── time-entries/
│   └── index.ts          # Router + CRUD handlers
├── actuals/
│   └── index.ts          # Router + CRUD handlers
├── projections/
│   └── index.ts          # Router + CRUD handlers
└── reference-data/
    └── index.ts          # Router: cost-codes + labor-rates (read-only)
```

## Why project-summary is Separate

The summary endpoint runs a complex aggregation query joining budget, actuals, and projections. It benefits from:

- Higher memory allocation (512MB vs 256MB for CRUD)
- Longer timeout (30s vs 10s)
- Independent scaling from CRUD operations

## Why reference-data is Combined

Cost codes and labor rates are both:

- Read-only (GET only)
- Reference/lookup data
- Rarely updated
- Small response payloads

No reason to split them into separate Lambdas.

## API Gateway → Lambda Mapping (CDK)

```typescript
// In api-stack.ts
const projects = api.root.addResource("projects");
const projectById = projects.addResource("{id}");
const projectSummary = projectById.addResource("summary");

// Lambda 1: projects CRUD
projects.addMethod("GET", new LambdaIntegration(projectsFn), authOptions);
projects.addMethod("POST", new LambdaIntegration(projectsFn), authOptions);
projectById.addMethod("GET", new LambdaIntegration(projectsFn), authOptions);
projectById.addMethod("PUT", new LambdaIntegration(projectsFn), authOptions);
projectById.addMethod("DELETE", new LambdaIntegration(projectsFn), authOptions);

// Lambda 2: project summary (separate for perf)
projectSummary.addMethod(
  "GET",
  new LambdaIntegration(projectSummaryFn),
  authOptions,
);

// Lambda 3: budget
const budget = projectById.addResource("budget");
const budgetLine = budget.addResource("{lineId}");
budget.addMethod("GET", new LambdaIntegration(budgetFn), authOptions);
budget.addMethod("POST", new LambdaIntegration(budgetFn), authOptions);
budgetLine.addMethod("PUT", new LambdaIntegration(budgetFn), authOptions);
budgetLine.addMethod("DELETE", new LambdaIntegration(budgetFn), authOptions);

// ... same pattern for employees, time-entries, actuals, projections

// Lambda 8: reference data (read-only)
const costCodes = api.root.addResource("cost-codes");
const costCodeById = costCodes.addResource("{id}");
const laborRates = api.root.addResource("labor-rates");
costCodes.addMethod("GET", new LambdaIntegration(referenceDataFn), authOptions);
costCodeById.addMethod(
  "GET",
  new LambdaIntegration(referenceDataFn),
  authOptions,
);
laborRates.addMethod(
  "GET",
  new LambdaIntegration(referenceDataFn),
  authOptions,
);
```

## Rules

1. **Do NOT create a new Lambda** unless it's listed in the table above
2. **Do NOT split a domain Lambda** into per-endpoint Lambdas (e.g., no `budget-create.ts`, `budget-list.ts`)
3. **Do NOT merge domains** into a single monolith Lambda
4. **The only exception** for a separate Lambda within a domain is when it has significantly different resource requirements (like project-summary)
5. **Reference data** (cost-codes, labor-rates) share one Lambda since they're all read-only GETs
