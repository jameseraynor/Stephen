# Project Structure

This document describes the organization of the codebase.

## Directory Structure

```
.
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # shadcn/ui base components (Button, Input, etc.)
│   │   │   ├── layout/     # Layout components (Header, Sidebar, Footer)
│   │   │   ├── features/   # Feature-specific components
│   │   │   │   ├── projects/      # Project management components
│   │   │   │   ├── budget/        # Budget entry components
│   │   │   │   ├── time-entry/    # Time entry components
│   │   │   │   └── reports/       # Report components
│   │   │   └── shared/     # Shared/reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useForm.ts
│   │   ├── lib/            # Utilities and helpers
│   │   │   ├── utils.ts
│   │   │   └── cn.ts
│   │   ├── types/          # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── services/       # API clients
│   │   │   ├── api.ts
│   │   │   ├── projectsApi.ts
│   │   │   └── authApi.ts
│   │   ├── utils/          # Pure utility functions
│   │   │   ├── formatCurrency.ts
│   │   │   ├── formatDate.ts
│   │   │   └── calculations.ts
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── aws-config.ts   # AWS Amplify configuration
│   ├── public/             # Static assets
│   ├── tests/              # Test files
│   ├── .env.example        # Environment variables template
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── backend/                  # Lambda functions
│   ├── src/
│   │   ├── functions/       # Lambda function handlers
│   │   │   ├── projects/
│   │   │   │   ├── list.ts
│   │   │   │   ├── get.ts
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── delete.ts
│   │   │   ├── budget/
│   │   │   │   ├── list.ts
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── delete.ts
│   │   │   ├── employees/
│   │   │   ├── time-entries/
│   │   │   ├── actuals/
│   │   │   ├── projections/
│   │   │   └── cost-codes/
│   │   ├── shared/          # Shared utilities
│   │   │   ├── db.ts        # Database client via RDS Proxy
│   │   │   ├── auth.ts      # Authentication helpers
│   │   │   ├── validation.ts # Zod validation schemas
│   │   │   ├── response.ts  # Standard response formatters
│   │   │   ├── logger.ts    # AWS Lambda Powertools Logger
│   │   │   └── errors.ts    # Error handling utilities
│   │   └── types/           # Shared types
│   │       └── index.ts
│   ├── tests/               # Test files
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── infrastructure/           # AWS CDK infrastructure
│   ├── bin/
│   │   └── app.ts           # CDK app entry point
│   ├── lib/
│   │   ├── network-stack.ts     # VPC, subnets, security groups
│   │   ├── database-stack.ts    # Aurora Serverless v2
│   │   ├── auth-stack.ts        # Cognito User Pool + Groups
│   │   ├── api-stack.ts         # API Gateway + Lambda functions
│   │   └── frontend-stack.ts    # S3 + CloudFront
│   ├── test/                # CDK tests
│   ├── cdk.context.example.json
│   ├── package.json
│   ├── tsconfig.json
│   └── cdk.json
│
├── database/                 # Database migrations and seeds
│   ├── migrations/          # SQL migration files
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_projects_table.sql
│   │   ├── 003_create_cost_codes_table.sql
│   │   ├── 004_create_labor_rates_table.sql
│   │   ├── 005_create_budget_lines_table.sql
│   │   ├── 006_create_employees_table.sql
│   │   ├── 007_create_time_entries_table.sql
│   │   ├── 008_create_actuals_table.sql
│   │   ├── 009_create_projection_snapshots_table.sql
│   │   ├── 010_create_projection_details_table.sql
│   │   └── 011_create_indexes.sql
│   ├── seeds/               # Seed data for development
│   │   ├── dev-cost-codes.sql
│   │   ├── dev-labor-rates.sql
│   │   └── dev-projects.sql
│   └── scripts/
│       ├── migrate.sh       # Run migrations
│       ├── rollback.sh      # Rollback last migration
│       ├── seed-db.sh       # Seed database
│       └── create-migration.sh
│
├── docs/                     # Documentation
│   ├── MVP_Project_Plan.md  # Complete MVP specification
│   ├── Design_System.md     # UI/UX design system
│   ├── STRUCTURE.md         # This file
│   └── api/
│       ├── openapi.yaml     # OpenAPI specification
│       ├── API_REFERENCE.md # API documentation
│       └── postman-collection.json
│
├── scripts/                  # Utility scripts
│   ├── setup.sh             # Initial project setup
│   ├── seed-db.sh           # Seed database with test data
│   ├── deploy.sh            # Deployment script
│   └── clean.sh             # Clean build artifacts
│
├── .kiro/                    # Kiro IDE configuration
│   └── steering/            # Development guidelines
│       ├── aws-cdk-patterns.md
│       ├── react-typescript-conventions.md
│       ├── api-design-standards.md
│       ├── database-conventions.md
│       ├── testing-guidelines.md
│       └── security-checklist.md
│
├── .gitignore
├── README.md                 # Main project documentation
└── STRUCTURE.md             # This file
```

## Key Directories

### Frontend (`frontend/`)

React + TypeScript application with Vite build tool.

- **components/ui**: Base UI components from shadcn/ui (copied into project)
- **components/layout**: App shell components (Header, Sidebar, etc.)
- **components/features**: Feature-specific components organized by domain
- **components/shared**: Reusable components used across features
- **hooks**: Custom React hooks for data fetching, forms, etc.
- **services**: API client functions using AWS Amplify
- **utils**: Pure utility functions (formatting, calculations)
- **types**: TypeScript type definitions

### Backend (`backend/`)

Node.js Lambda functions with TypeScript.

- **functions**: Lambda handlers organized by resource/domain
- **shared**: Utilities shared across Lambda functions
  - Database client via AWS RDS Proxy
  - Authentication/authorization helpers
  - Validation schemas
  - Response formatters
  - AWS Lambda Powertools Logger
- **types**: Shared TypeScript types

### Infrastructure (`infrastructure/`)

AWS CDK infrastructure as code.

- **bin**: CDK app entry point
- **lib**: CDK stack definitions
  - NetworkStack: VPC, subnets, security groups
  - DatabaseStack: Aurora Serverless v2
  - AuthStack: Cognito User Pool
  - ApiStack: API Gateway + Lambda functions
  - FrontendStack: S3 + CloudFront

### Database (`database/`)

Database schema and data management.

- **migrations**: SQL migration files (numbered sequentially)
- **seeds**: Development seed data
- **scripts**: Database management scripts

### Documentation (`docs/`)

Project documentation.

- **MVP_Project_Plan.md**: Complete MVP specification
- **Design_System.md**: UI/UX guidelines
- **api/**: API documentation and specifications

### Scripts (`scripts/`)

Utility scripts for development and deployment.

## File Naming Conventions

### Frontend

- Components: PascalCase (`ProjectCard.tsx`)
- Hooks: camelCase with 'use' prefix (`useProjects.ts`)
- Utils: camelCase (`formatCurrency.ts`)
- Types: camelCase (`index.ts`)
- Tests: Same as source with `.test.tsx` suffix

### Backend

- Lambda handlers: kebab-case (`list.ts`, `create.ts`)
- Shared utilities: camelCase (`db.ts`, `validation.ts`)
- Types: camelCase (`index.ts`)
- Tests: Same as source with `.test.ts` suffix

### Infrastructure

- Stacks: kebab-case (`network-stack.ts`)
- Tests: Same as source with `.test.ts` suffix

### Database

- Migrations: `NNN_description.sql` (e.g., `001_create_users_table.sql`)
- Seeds: `dev-description.sql` (e.g., `dev-cost-codes.sql`)

## Import Paths

### Frontend

Use path aliases configured in `tsconfig.json`:

```typescript
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Project } from "@/types";
```

### Backend

Use relative imports:

```typescript
import { query } from "../shared/db";
import { validateRequest } from "../shared/validation";
import type { Project } from "../types";
```

## Testing Structure

### Frontend Tests

Located alongside source files:

```
src/
├── components/
│   ├── ProjectCard.tsx
│   └── ProjectCard.test.tsx
├── hooks/
│   ├── useProjects.ts
│   └── useProjects.test.ts
```

### Backend Tests

Located in `tests/` directory mirroring `src/`:

```
backend/
├── src/
│   └── functions/
│       └── projects/
│           └── list.ts
└── tests/
    └── functions/
        └── projects/
            └── list.test.ts
```

## Build Artifacts

### Frontend

- `dist/`: Production build output
- `coverage/`: Test coverage reports
- `node_modules/`: Dependencies

### Backend

- `dist/`: Compiled JavaScript
- `coverage/`: Test coverage reports
- `node_modules/`: Dependencies

### Infrastructure

- `cdk.out/`: CloudFormation templates
- `node_modules/`: Dependencies

All build artifacts are excluded from git via `.gitignore`.
