# Architecture Decision Records (ADRs)

This document captures key architectural decisions made for the Project Cost Control System.

## ADR Format

Each decision follows this structure:

- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Context**: What is the issue we're facing?
- **Decision**: What did we decide?
- **Consequences**: What are the trade-offs?

---

## ADR-001: Serverless Architecture on AWS

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Architecture Team

### Context

Need to build a cost-effective, scalable system for construction project cost control with:

- Variable workload (peak during business hours)
- Small team (limited DevOps resources)
- Need for rapid development and deployment
- Budget constraints

### Decision

Adopt fully serverless architecture using:

- **Frontend**: React SPA on S3 + CloudFront
- **API**: API Gateway + Lambda (Node.js)
- **Database**: Aurora Serverless v2 (PostgreSQL)
- **Auth**: AWS Cognito
- **IaC**: AWS CDK (TypeScript)

### Consequences

**Positive:**

- ✅ Pay-per-use pricing (cost-effective for variable load)
- ✅ Auto-scaling without configuration
- ✅ No server management overhead
- ✅ Built-in high availability
- ✅ Fast deployment cycles
- ✅ AWS handles security patches

**Negative:**

- ❌ Cold start latency for Lambda (mitigated with provisioned concurrency if needed)
- ❌ Vendor lock-in to AWS
- ❌ Learning curve for serverless patterns
- ❌ Debugging can be more complex

**Mitigation:**

- Use AWS RDS Proxy for database connection management
- Implement proper monitoring and logging with Lambda Powertools
- Keep business logic portable (separate from AWS-specific code)

---

## ADR-002: PostgreSQL over DynamoDB

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Architecture Team, Database Team

### Context

Need to choose primary database for:

- Complex relational data (projects, budgets, time entries)
- ACID transactions required
- Complex queries and aggregations
- Reporting requirements

### Decision

Use **Aurora Serverless v2 with PostgreSQL 16** instead of DynamoDB.

### Consequences

**Positive:**

- ✅ ACID transactions for data integrity
- ✅ Complex JOINs and aggregations
- ✅ Familiar SQL for team
- ✅ Rich data types (DECIMAL for currency)
- ✅ Foreign key constraints
- ✅ Mature ecosystem and tooling
- ✅ Easy migration path if needed

**Negative:**

- ❌ More expensive than DynamoDB at scale
- ❌ Connection management required
- ❌ Not as infinitely scalable as DynamoDB

**Why not DynamoDB:**

- Complex access patterns would require multiple GSIs
- No native support for aggregations
- Difficult to model relational data
- Team lacks NoSQL expertise

---

## ADR-003: React + TypeScript for Frontend

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Frontend Team

### Context

Need modern, maintainable frontend framework with:

- Strong typing for large codebase
- Component reusability
- Good developer experience
- Active ecosystem

### Decision

Use **React 18 + TypeScript + Vite** with:

- **UI Library**: shadcn/ui (Radix UI + Tailwind)
- **State Management**: React hooks (no Redux for MVP)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **API Client**: AWS Amplify

### Consequences

**Positive:**

- ✅ TypeScript catches errors at compile time
- ✅ Excellent IDE support and autocomplete
- ✅ Large ecosystem and community
- ✅ Easy to find developers
- ✅ Component reusability
- ✅ Fast development with Vite

**Negative:**

- ❌ Initial TypeScript setup overhead
- ❌ Learning curve for TypeScript
- ❌ Larger bundle size than vanilla JS

**Alternatives Considered:**

- Vue.js: Less familiar to team
- Angular: Too heavy for this use case
- Svelte: Smaller ecosystem

---

## ADR-004: Monorepo Structure

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Architecture Team

### Context

Need to organize:

- Frontend (React)
- Backend (Lambda functions)
- Infrastructure (CDK)
- Database migrations
- Shared types

### Decision

Use **monorepo** with clear separation:

```
/frontend     - React application
/backend      - Lambda functions
/infrastructure - AWS CDK
/database     - Migrations and seeds
/docs         - Documentation
```

### Consequences

**Positive:**

- ✅ Single source of truth
- ✅ Shared TypeScript types between frontend/backend
- ✅ Atomic commits across layers
- ✅ Easier dependency management
- ✅ Simplified CI/CD

**Negative:**

- ❌ Larger repository size
- ❌ Need clear boundaries between modules
- ❌ Potential for tight coupling if not careful

**Alternatives Considered:**

- Multi-repo: Too much overhead for small team
- Lerna/Nx: Overkill for current scale

---

## ADR-005: Cognito for Authentication

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Security Team, Architecture Team

### Context

Need authentication system with:

- Email/password login
- Microsoft SSO integration
- MFA support
- User management
- JWT tokens for API

### Decision

Use **AWS Cognito User Pools** with:

- Email/password authentication
- SAML federation for Microsoft SSO
- TOTP-based MFA
- User groups for RBAC (Admin, ProjectManager, Viewer)

### Consequences

**Positive:**

- ✅ Fully managed service
- ✅ Built-in security features
- ✅ Scales automatically
- ✅ Integrates with API Gateway
- ✅ Supports MFA and SSO
- ✅ Compliance certifications

**Negative:**

- ❌ Limited customization of UI
- ❌ Vendor lock-in
- ❌ Complex pricing model

**Alternatives Considered:**

- Auth0: More expensive
- Custom solution: Too much maintenance
- Firebase Auth: Not AWS-native

---

## ADR-006: API Gateway REST API over HTTP API

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Backend Team

### Context

Need API layer with:

- Request validation
- Authentication/authorization
- Rate limiting
- Request/response transformation

### Decision

Use **API Gateway REST API** (not HTTP API).

### Consequences

**Positive:**

- ✅ Built-in request validation
- ✅ Cognito authorizer support
- ✅ API keys for service-to-service
- ✅ Request/response transformation
- ✅ More features than HTTP API

**Negative:**

- ❌ More expensive than HTTP API
- ❌ Slightly higher latency

**Why not HTTP API:**

- No request validation
- Limited authorization options
- Fewer features for our use case

---

## ADR-007: Node.js 24 for Lambda Functions

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: Backend Team

### Context

Need runtime for Lambda functions with:

- Good performance
- TypeScript support
- Familiar to team
- Good AWS SDK support

### Decision

Use **Node.js 24.x** (latest LTS) with TypeScript.

### Consequences

**Positive:**

- ✅ Fast cold starts
- ✅ Native TypeScript support
- ✅ Team expertise
- ✅ Excellent AWS SDK v3 support
- ✅ Large ecosystem

**Negative:**

- ❌ Single-threaded (not an issue for our use case)
- ❌ Memory management less efficient than compiled languages

**Alternatives Considered:**

- Python: Team less familiar
- Go: Faster but steeper learning curve
- Java: Slower cold starts

---

## ADR-008: AWS CDK over CloudFormation/Terraform

**Status**: Accepted  
**Date**: 2025-01-15  
**Deciders**: DevOps Team, Architecture Team

### Context

Need Infrastructure as Code solution for:

- AWS resource provisioning
- Repeatable deployments
- Environment management (dev, prod)

### Decision

Use **AWS CDK with TypeScript**.

### Consequences

**Positive:**

- ✅ Type-safe infrastructure code
- ✅ Reusable constructs
- ✅ Same language as application (TypeScript)
- ✅ Better abstractions than raw CloudFormation
- ✅ Built-in best practices
- ✅ Native AWS support

**Negative:**

- ❌ AWS-specific (not multi-cloud)
- ❌ Learning curve for CDK patterns
- ❌ Generates verbose CloudFormation

**Alternatives Considered:**

- Terraform: Multi-cloud but team lacks expertise
- CloudFormation: Too verbose, no type safety
- Pulumi: Similar to CDK but less mature

---

## ADR-009: Connection Management for Lambda-RDS

**Status**: Updated  
**Date**: 2025-02-17  
**Deciders**: Backend Team, Database Team

### Context

Lambda functions are stateless and create new database connections, which can:

- Exhaust database connections
- Cause performance issues
- Increase latency

### Decision

Use **AWS RDS Proxy** for centralized connection pooling. Lambda functions connect to the RDS Proxy endpoint using a single `pg.Client` connection per invocation. RDS Proxy manages the shared connection pool across all concurrent Lambda containers.

```typescript
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
```

### Consequences

**Positive:**

- ✅ Centralized connection pooling across all Lambda invocations
- ✅ Prevents connection exhaustion even with high concurrency
- ✅ Automatic failover to Aurora replicas
- ✅ Supports credential rotation via Secrets Manager
- ✅ Simpler Lambda code (single Client, no Pool management)

**Negative:**

- ❌ Additional AWS cost (~$0.015/hr per vCPU)
- ❌ Adds ~1-2ms latency per connection (proxy hop)

**Previous Decision (Superseded):**

- `pg.Pool` with max 2 connections per Lambda — replaced because 50+ concurrent Lambdas could still exhaust Aurora connections

---

## ADR-010: Zod for Runtime Validation

**Status**: Accepted  
**Date**: 2025-01-20  
**Deciders**: Backend Team, Frontend Team

### Context

Need runtime validation for:

- API request/response validation
- Form validation
- Type safety at runtime

### Decision

Use **Zod** for schema validation on both frontend and backend.

### Consequences

**Positive:**

- ✅ TypeScript-first design
- ✅ Infers types from schemas
- ✅ Works on frontend and backend
- ✅ Excellent error messages
- ✅ Composable schemas

**Negative:**

- ❌ Adds bundle size
- ❌ Another dependency to maintain

**Alternatives Considered:**

- Joi: Not TypeScript-first
- Yup: Less type-safe
- class-validator: Requires decorators

---

## ADR-011: shadcn/ui over Material-UI

**Status**: Accepted  
**Date**: 2025-01-20  
**Deciders**: Frontend Team, Design Team

### Context

Need UI component library with:

- Modern design
- Accessibility
- Customization
- Good DX

### Decision

Use **shadcn/ui** (Radix UI + Tailwind CSS).

### Consequences

**Positive:**

- ✅ Copy components into codebase (full control)
- ✅ Built on Radix UI (accessible)
- ✅ Tailwind CSS for styling
- ✅ Modern, clean design
- ✅ No runtime overhead
- ✅ Easy customization

**Negative:**

- ❌ Need to copy/update components manually
- ❌ Smaller ecosystem than MUI

**Alternatives Considered:**

- Material-UI: Too opinionated, harder to customize
- Ant Design: Not modern enough
- Chakra UI: Good but prefer Tailwind

---

## ADR-012: Manual Database Migrations

**Status**: Accepted  
**Date**: 2025-01-20  
**Deciders**: Database Team

### Context

Need database schema management with:

- Version control
- Rollback capability
- Team collaboration

### Decision

Use **manual SQL migrations** with:

- Numbered migration files
- Up/down scripts
- Shell script for execution

### Consequences

**Positive:**

- ✅ Full control over SQL
- ✅ Easy to review in PRs
- ✅ No ORM overhead
- ✅ Simple to understand

**Negative:**

- ❌ Manual process
- ❌ No automatic rollback
- ❌ Need discipline to maintain

**Alternatives Considered:**

- Prisma: Adds ORM overhead
- TypeORM: Too complex for needs
- Flyway: Java dependency

---

## Future ADRs to Consider

As the project evolves, document decisions for:

1. **Caching Strategy** (Redis, CloudFront, etc.)
2. **Monitoring & Observability** (CloudWatch, X-Ray, third-party)
3. **CI/CD Pipeline** (GitHub Actions, CodePipeline)
4. **Testing Strategy** (Unit, Integration, E2E)
5. **Error Handling & Logging** (Structured logging, error tracking)
6. **Feature Flags** (LaunchDarkly, custom solution)
7. **Data Backup & Recovery** (RTO, RPO requirements)
8. **Multi-tenancy** (If needed in future)
9. **API Versioning** (When breaking changes needed)
10. **Performance Optimization** (When scale increases)

---

## Review Process

ADRs should be:

1. Proposed in PR with discussion
2. Reviewed by relevant teams
3. Approved by tech lead/architect
4. Updated when superseded

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
