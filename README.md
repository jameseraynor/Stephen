# Project Cost Control System

A serverless web application for construction project cost management, budget tracking, and financial projections.

## Overview

This system helps construction companies track project costs, manage budgets, record daily time entries, and generate financial projections. Built with a serverless architecture on AWS for scalability and cost-effectiveness.

## Tech Stack

### Frontend
- **Framework**: React 19.2 + TypeScript 5.7
- **Build Tool**: Vite 6
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS 4)
- **Routing**: React Router v7
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form + Zod validation
- **API Client**: AWS Amplify Library v6
- **Testing**: Vitest 3 + React Testing Library

### Backend
- **API**: AWS API Gateway (REST)
- **Compute**: AWS Lambda (Node.js 24 LTS)
- **Database**: Aurora Serverless v2 (PostgreSQL 16)
- **Authentication**: Amazon Cognito (with Microsoft SSO)
- **Secrets**: AWS Secrets Manager

### Infrastructure
- **IaC**: AWS CDK v2 (TypeScript)
- **Deployment**: CloudFormation
- **Monitoring**: CloudWatch + X-Ray

## Features

### MVP Scope
- ✅ User authentication (Cognito + Microsoft SSO)
- ✅ Multi-factor authentication (TOTP)
- ✅ Role-based access control (Admin, Project Manager, Viewer)
- ✅ Project management (CRUD operations)
- ✅ Budget entry and tracking
- ✅ Employee roster management
- ✅ Daily time entry (manual)
- ✅ Monthly actuals tracking
- ✅ Financial projections with snapshots
- ✅ Cost code management
- ✅ Dashboard with project summaries

### Future Roadmap
- Spectrum ERP integration for time entries
- Advanced reporting and analytics
- Multi-project comparison
- Budget vs. Actual variance analysis
- Responsive design (tablet, mobile)
- Integration and E2E testing

## Project Structure

```
.
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── features/   # Feature-specific components
│   │   │   └── shared/     # Shared components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   ├── types/          # TypeScript type definitions
│   │   ├── services/       # API clients
│   │   ├── utils/          # Pure utility functions
│   │   └── App.tsx
│   ├── public/
│   ├── tests/
│   └── package.json
│
├── backend/                  # Lambda functions
│   ├── src/
│   │   ├── functions/
│   │   │   ├── projects/   # Project endpoints
│   │   │   ├── budget/     # Budget endpoints
│   │   │   ├── employees/  # Employee endpoints
│   │   │   ├── time-entries/ # Time entry endpoints
│   │   │   ├── actuals/    # Actuals endpoints
│   │   │   └── projections/ # Projections endpoints
│   │   ├── shared/         # Shared utilities
│   │   │   ├── db.ts       # Database client
│   │   │   ├── auth.ts     # Auth helpers
│   │   │   └── validation.ts # Validation schemas
│   │   └── types/          # Shared types
│   ├── tests/
│   └── package.json
│
├── infrastructure/           # AWS CDK infrastructure
│   ├── bin/
│   │   └── app.ts          # CDK app entry point
│   ├── lib/
│   │   ├── network-stack.ts    # VPC, subnets, security groups
│   │   ├── database-stack.ts   # Aurora Serverless v2
│   │   ├── auth-stack.ts       # Cognito User Pool
│   │   ├── api-stack.ts        # API Gateway + Lambda
│   │   └── frontend-stack.ts   # S3 + CloudFront
│   ├── test/
│   └── package.json
│
├── database/                 # Database migrations and seeds
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_projects_table.sql
│   │   └── ...
│   └── seeds/
│       └── dev-data.sql
│
├── docs/                     # Documentation
│   ├── MVP_Project_Plan.md
│   ├── Design_System.md
│   └── api/
│       └── openapi.yaml
│
├── scripts/                  # Utility scripts
│   ├── setup.sh            # Initial setup script
│   ├── seed-db.sh          # Seed database
│   └── deploy.sh           # Deployment script
│
├── .kiro/                    # Kiro IDE configuration
│   └── steering/           # Development guidelines
│
└── README.md
```

## Prerequisites

- **Node.js**: v24.x LTS (Krypton) or higher
- **npm**: v10.x or higher
- **AWS CLI**: v2.x configured with credentials
- **AWS CDK**: v2.x (`npm install -g aws-cdk`)
- **PostgreSQL**: v16.x (for local development, optional)
- **Git**: v2.x

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jameseraynor/Stephen.git
cd Stephen
```

### 2. Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install dependencies for all packages
- Copy environment templates
- Initialize git hooks
- Verify prerequisites

### 3. Configure Environment Variables

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your AWS resources (after infrastructure deployment):
```
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_API_ENDPOINT=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_AWS_REGION=us-east-1
```

#### Infrastructure (cdk.context.json)
```bash
cd infrastructure
```

Edit `cdk.context.json` with your configuration:
```json
{
  "environment": "dev",
  "dev": {
    "logLevel": "DEBUG",
    "auroraMinCapacity": 0.5,
    "auroraMaxCapacity": 1
  }
}
```

### 4. Deploy Infrastructure

```bash
cd infrastructure

# Bootstrap CDK (first time only)
cdk bootstrap

# Synthesize CloudFormation templates
npm run cdk synth

# Deploy all stacks
npm run cdk deploy --all

# Note the outputs (API endpoint, User Pool ID, etc.)
```

### 5. Initialize Database

```bash
cd database

# Run migrations
./scripts/migrate.sh

# Seed development data (optional)
./scripts/seed-db.sh
```

### 6. Create First User

```bash
# Using AWS CLI
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=given_name,Value=Admin Name=family_name,Value=User \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Add user to Admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username admin@example.com \
  --group-name Admin
```

### 7. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Open http://localhost:5173

## Development

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Build for production
npm run build
```

### Backend Development

```bash
cd backend

# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

### Infrastructure Development

```bash
cd infrastructure

# Synthesize CloudFormation
npm run cdk synth

# Show differences
npm run cdk diff

# Deploy specific stack
npm run cdk deploy DatabaseStack

# Destroy all stacks (careful!)
npm run cdk destroy --all
```

### Database Migrations

```bash
cd database

# Create new migration
./scripts/create-migration.sh "add_column_to_projects"

# Run migrations
./scripts/migrate.sh

# Rollback last migration
./scripts/rollback.sh
```

## Testing

### Unit Tests
```bash
# Frontend
cd frontend && npm run test

# Backend
cd backend && npm run test

# Infrastructure
cd infrastructure && npm run test
```

### Coverage Reports
```bash
# Frontend with coverage
cd frontend && npm run test:coverage

# View coverage report
open frontend/coverage/index.html
```

## Deployment

### Development Environment
```bash
cd infrastructure
npm run cdk deploy --all --context environment=dev
```

### Production Environment
```bash
cd infrastructure
npm run cdk deploy --all --context environment=prod
```

### Frontend Deployment
```bash
cd frontend

# Build production bundle
npm run build

# Deploy to S3 (via CDK)
cd ../infrastructure
npm run cdk deploy FrontendStack
```

## Architecture

### High-Level Architecture
```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  CloudFront + S3 (Frontend)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  API Gateway + Cognito Authorizer   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Lambda Functions (Node.js 20)      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Aurora Serverless v2 (PostgreSQL)  │
└─────────────────────────────────────┘
```

### Security Architecture
- All API endpoints protected by Cognito JWT tokens
- Database in private subnet (no internet access)
- Lambda functions in VPC with security groups
- Secrets stored in AWS Secrets Manager
- Encryption at rest and in transit
- MFA required for Admin users

## User Roles & Permissions

| Feature | Admin | Project Manager | Viewer |
|---------|-------|-----------------|--------|
| View all projects | ✅ | ✅ | ✅ |
| Create/edit projects | ✅ | ✅ (assigned only) | ❌ |
| Delete projects | ✅ | ❌ | ❌ |
| Manage budget | ✅ | ✅ (assigned only) | ❌ |
| Enter time | ✅ | ✅ (assigned only) | ❌ |
| View actuals | ✅ | ✅ | ✅ |
| Create projections | ✅ | ✅ (assigned only) | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Manage cost codes | ✅ | ❌ | ❌ |

## API Documentation

API documentation is available in OpenAPI format:
- [OpenAPI Spec](docs/api/openapi.yaml)
- Postman Collection: Import `docs/api/postman-collection.json`

Base URL: `https://[api-id].execute-api.us-east-1.amazonaws.com/prod`

Authentication: Bearer token (Cognito JWT)

## Troubleshooting

### Common Issues

**Issue**: `cdk deploy` fails with "No stacks match"
```bash
# Solution: Synthesize first
npm run cdk synth
npm run cdk deploy --all
```

**Issue**: Frontend can't connect to API
```bash
# Solution: Check environment variables
cat frontend/.env
# Verify API endpoint and Cognito IDs match CDK outputs
```

**Issue**: Database connection timeout
```bash
# Solution: Verify Lambda is in correct VPC and security groups
# Check CloudWatch logs for connection errors
```

**Issue**: Cognito authentication fails
```bash
# Solution: Verify user exists and is in correct group
aws cognito-idp admin-get-user \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username user@example.com
```

## Monitoring

### CloudWatch Dashboards
- API Gateway metrics: Request count, latency, errors
- Lambda metrics: Invocations, duration, errors, throttles
- Database metrics: CPU, connections, query performance

### CloudWatch Logs
- API Gateway logs: `/aws/apigateway/cost-control-api`
- Lambda logs: `/aws/lambda/cost-control-[function-name]`
- Database logs: `/aws/rds/cluster/cost-control-db/postgresql`

### Alarms
- API error rate > 5%
- Lambda error rate > 2%
- Database CPU > 80%
- Unauthorized access attempts > 50/hour

## Cost Estimation

### MVP (2 users, light usage)
- Aurora Serverless v2: ~$50/month (0.5-1 ACU)
- Lambda: ~$5/month (free tier eligible)
- API Gateway: ~$5/month (free tier eligible)
- Cognito: Free (< 50,000 MAU)
- CloudFront + S3: ~$5/month
- **Total**: ~$65/month

### Production (100 users, moderate usage)
- Aurora Serverless v2: ~$150/month (0.5-2 ACU)
- Lambda: ~$20/month
- API Gateway: ~$15/month
- Cognito: ~$25/month
- CloudFront + S3: ~$15/month
- **Total**: ~$225/month

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Proprietary - All rights reserved

## Support

For issues or questions:
- Create an issue in GitHub
- Contact: [your-email@example.com]

## Acknowledgments

- Built with [AWS CDK](https://aws.amazon.com/cdk/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
