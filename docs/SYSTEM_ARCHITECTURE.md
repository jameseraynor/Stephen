# System Architecture Overview

## Table of Contents

- [Executive Summary](#executive-summary)
- [Architecture Principles](#architecture-principles)
- [System Context](#system-context)
- [Architecture Layers](#architecture-layers)
- [Technology Stack](#technology-stack)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability & Performance](#scalability--performance)
- [Disaster Recovery](#disaster-recovery)

---

## Executive Summary

The Project Cost Control System is a **serverless, cloud-native application** built on AWS that enables construction companies to track project costs, manage budgets, and generate financial projections in real-time.

### Key Characteristics

- **Architecture Style**: Serverless, Event-Driven
- **Deployment Model**: Cloud-Native (AWS)
- **Data Model**: Relational (PostgreSQL)
- **Frontend**: Single Page Application (React)
- **API Style**: RESTful
- **Authentication**: JWT-based with SSO support

### Quality Attributes

| Attribute           | Target         | Strategy                          |
| ------------------- | -------------- | --------------------------------- |
| **Availability**    | 99.9%          | Multi-AZ deployment, auto-scaling |
| **Performance**     | < 2s page load | CDN, caching, optimized queries   |
| **Security**        | SOC 2 ready    | Encryption, MFA, RBAC, audit logs |
| **Scalability**     | 1000+ users    | Serverless auto-scaling           |
| **Maintainability** | High           | Clean architecture, documentation |
| **Cost**            | Pay-per-use    | Serverless, auto-scaling to zero  |

---

## Architecture Principles

### 1. Serverless First

- No server management
- Pay only for what you use
- Auto-scaling built-in
- Focus on business logic

### 2. Security by Design

- Encryption at rest and in transit
- Least privilege access
- MFA for sensitive operations
- Audit logging

### 3. Cloud-Native

- Leverage managed services
- Infrastructure as Code
- Automated deployments
- Built-in monitoring

### 4. API-First

- Well-defined contracts
- Versioned APIs
- Documentation-driven
- Type-safe

### 5. Data Integrity

- ACID transactions
- Foreign key constraints
- Input validation
- Audit trails

### 6. Developer Experience

- Type safety (TypeScript)
- Fast feedback loops
- Clear documentation
- Automated testing

---

## System Context

### External Systems

```
┌─────────────┐
│   Users     │
│ (Browser)   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Project Cost Control System (AWS)  │
│  - Frontend (React SPA)             │
│  - API (Lambda + API Gateway)       │
│  - Database (Aurora PostgreSQL)     │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│      External Integrations          │
│  - Microsoft Azure AD (SSO)         │
│  - Spectrum ERP (Future)            │
│  - Email Service (SES)              │
└─────────────────────────────────────┘
```

### User Roles

1. **Admin**
   - Full system access
   - User management
   - System configuration

2. **Project Manager**
   - Manage assigned projects
   - Enter/edit data
   - Generate reports

3. **Viewer**
   - Read-only access
   - View reports
   - Export data

---

## Architecture Layers

### 1. Presentation Layer

**Technology**: React 18 + TypeScript + Vite

**Components**:

- Single Page Application (SPA)
- Responsive design
- Progressive Web App capabilities
- Offline-first (future)

**Hosting**:

- S3 for static assets
- CloudFront for global CDN
- HTTPS only

### 2. API Layer

**Technology**: AWS API Gateway + Lambda (Node.js 24)

**Features**:

- RESTful endpoints
- JWT authentication
- Request validation
- Rate limiting (100 req/s)
- CORS configuration

**Functions**:

- Projects API
- Budget API
- Time Entry API
- Actuals API
- Projections API

### 3. Business Logic Layer

**Technology**: Lambda Functions (Node.js + TypeScript)

**Patterns**:

- Single Responsibility Principle
- Dependency Injection
- Error handling middleware
- Logging and monitoring

**Key Operations**:

- CRUD operations
- Business calculations
- Data aggregations
- Report generation

### 4. Data Layer

**Technology**: Aurora Serverless v2 (PostgreSQL 16)

**Features**:

- ACID transactions
- Foreign key constraints
- Stored procedures (minimal)
- Connection pooling

**Tables**: 10 core tables

- PROJECTS
- BUDGET_LINES
- EMPLOYEES
- DAILY_TIME_ENTRIES
- ACTUALS
- PROJECTION_SNAPSHOTS
- PROJECTION_DETAILS
- COST_CODES
- LABOR_RATES
- USERS (Cognito)

### 5. Security Layer

**Technology**: AWS Cognito + IAM

**Features**:

- User authentication
- Role-based access control (RBAC)
- MFA support
- SSO integration (Microsoft)
- JWT token management

---

## Technology Stack

### Frontend

| Component  | Technology      | Version |
| ---------- | --------------- | ------- |
| Framework  | React           | 18.x    |
| Language   | TypeScript      | 5.x     |
| Build Tool | Vite            | 5.x     |
| UI Library | shadcn/ui       | Latest  |
| Styling    | Tailwind CSS    | 3.x     |
| State      | React Hooks     | -       |
| Routing    | React Router    | 6.x     |
| Forms      | React Hook Form | 7.x     |
| Validation | Zod             | 3.x     |
| API Client | AWS Amplify     | 6.x     |

### Backend

| Component | Technology           | Version       |
| --------- | -------------------- | ------------- |
| Runtime   | Node.js              | 24.x          |
| Language  | TypeScript           | 5.x           |
| API       | API Gateway          | REST          |
| Compute   | Lambda               | -             |
| Database  | Aurora Serverless v2 | PostgreSQL 16 |
| Auth      | Cognito              | -             |
| Secrets   | Secrets Manager      | -             |

### Infrastructure

| Component  | Technology     | Version |
| ---------- | -------------- | ------- |
| IaC        | AWS CDK        | 2.x     |
| Language   | TypeScript     | 5.x     |
| CI/CD      | GitHub Actions | -       |
| Monitoring | CloudWatch     | -       |
| Tracing    | X-Ray          | -       |

### Development Tools

| Tool       | Purpose              |
| ---------- | -------------------- |
| VS Code    | IDE                  |
| ESLint     | Linting              |
| Prettier   | Code formatting      |
| Vitest     | Unit testing         |
| Playwright | E2E testing (future) |
| PlantUML   | Diagrams             |

---

## Data Flow

### 1. User Request Flow

```
User → CloudFront → S3 (React App)
  ↓
React App → API Gateway (JWT token)
  ↓
API Gateway → Cognito (validate token)
  ↓
API Gateway → Lambda (invoke)
  ↓
Lambda → Secrets Manager (get DB credentials)
  ↓
Lambda → Aurora (query)
  ↓
Lambda → CloudWatch (logs)
  ↓
Lambda → API Gateway (response)
  ↓
API Gateway → React App (JSON)
  ↓
React App → User (UI update)
```

### 2. Time Entry to Actuals Flow

```
PM enters daily time
  ↓
Stored in DAILY_TIME_ENTRIES
  ↓
Aggregation function (monthly)
  ↓
Calculate: Hours × Rate × Burden
  ↓
Create/Update ACTUALS
  ↓
Update project GP calculations
```

### 3. Projection Calculation Flow

```
Historical actuals + Budget
  ↓
Calculate % complete
  ↓
Estimate remaining costs
  ↓
Project final costs
  ↓
Calculate projected GP
  ↓
Store in PROJECTION_SNAPSHOTS
```

---

## Security Architecture

### Authentication Flow

1. User enters credentials
2. Cognito validates
3. Returns JWT tokens (id, access, refresh)
4. Frontend stores tokens securely
5. All API calls include JWT in Authorization header
6. API Gateway validates with Cognito
7. Lambda receives user context

### Authorization

**Role-Based Access Control (RBAC)**:

- Roles stored in Cognito groups
- Lambda checks user groups
- Returns 403 if unauthorized

### Data Security

**Encryption at Rest**:

- Aurora: AES-256
- S3: SSE-S3
- Secrets Manager: KMS

**Encryption in Transit**:

- HTTPS only (TLS 1.2+)
- API Gateway enforces HTTPS
- CloudFront enforces HTTPS

### Network Security

**VPC Configuration**:

- Aurora in private subnet (no internet)
- Lambda in VPC
- Security groups restrict access
- No public endpoints

---

## Scalability & Performance

### Horizontal Scaling

| Component   | Scaling Strategy                   |
| ----------- | ---------------------------------- |
| Frontend    | CloudFront edge locations (global) |
| API Gateway | Auto-scales to demand              |
| Lambda      | Auto-scales (1000 concurrent)      |
| Aurora      | Auto-scales (0.5-2 ACU)            |

### Performance Optimizations

**Frontend**:

- Code splitting
- Lazy loading
- Image optimization
- CDN caching

**Backend**:

- Connection pooling
- Query optimization
- Indexed columns
- Pagination

**Database**:

- Proper indexes
- Query optimization
- Connection pooling
- Read replicas (future)

### Caching Strategy

**CloudFront**:

- Static assets: 1 year
- HTML: No cache (SPA)

**API Gateway**:

- No caching (MVP)
- Future: Cache GET requests

**Database**:

- No caching (MVP)
- Future: Redis for hot data

---

## Disaster Recovery

### Backup Strategy

**Database**:

- Automated daily backups
- 7-day retention
- Point-in-time recovery
- Cross-region snapshots (future)

**Code**:

- Git repository (GitHub)
- Multiple branches
- Tagged releases

**Infrastructure**:

- CDK code in Git
- Reproducible deployments

### Recovery Objectives

| Metric                  | Target  | Strategy             |
| ----------------------- | ------- | -------------------- |
| **RTO** (Recovery Time) | 4 hours | Automated deployment |
| **RPO** (Data Loss)     | 1 hour  | Continuous backups   |
| **Availability**        | 99.9%   | Multi-AZ deployment  |

### Incident Response

1. **Detection**: CloudWatch alarms
2. **Notification**: SNS to team
3. **Assessment**: Review logs and metrics
4. **Recovery**: Rollback or hotfix
5. **Post-mortem**: Document and improve

---

## Monitoring & Observability

### Metrics

**Application**:

- Request count
- Error rate
- Response time
- User activity

**Infrastructure**:

- Lambda invocations
- Lambda errors
- Lambda duration
- Database connections
- Database CPU/memory

### Logging

**Levels**:

- ERROR: Failures
- WARN: Potential issues
- INFO: Key events
- DEBUG: Detailed info (dev only)

**Destinations**:

- CloudWatch Logs
- Structured JSON format
- Retention: 30 days

### Alerting

**Critical Alerts**:

- API error rate > 5%
- Database connections > 80%
- Lambda errors > 10/min
- Authentication failures > 50/min

**Notification**:

- SNS to email
- Slack integration (future)

---

## Cost Optimization

### Current Costs (Estimated)

| Service              | Monthly Cost |
| -------------------- | ------------ |
| Aurora Serverless v2 | $50-100      |
| Lambda               | $20-50       |
| API Gateway          | $10-30       |
| CloudFront           | $5-20        |
| Cognito              | $0-10        |
| **Total**            | **$85-210**  |

### Optimization Strategies

1. **Aurora**: Scales to 0.5 ACU when idle
2. **Lambda**: Right-sized memory
3. **CloudFront**: Efficient caching
4. **S3**: Lifecycle policies
5. **Logs**: 30-day retention

---

## Future Enhancements

### Phase 2 (Post-MVP)

1. **Caching Layer**: Redis for hot data
2. **Read Replicas**: Database read scaling
3. **Async Processing**: SQS + Lambda for heavy operations
4. **Real-time Updates**: WebSockets for live data
5. **Advanced Analytics**: QuickSight dashboards

### Phase 3 (Scale)

1. **Multi-region**: Global deployment
2. **CDN Optimization**: Advanced caching
3. **Database Sharding**: Horizontal scaling
4. **Microservices**: Split monolithic Lambda
5. **Event Sourcing**: Audit trail improvements

---

## References

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Serverless Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Architecture Decision Records](ARCHITECTURE_DECISION_RECORDS.md)
- [API Reference](api/API_REFERENCE.md)
- [Security Checklist](.kiro/steering/security-checklist.md)
