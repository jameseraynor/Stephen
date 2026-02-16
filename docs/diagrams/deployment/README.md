# Deployment Diagrams

Infrastructure deployment and CI/CD processes.

## Diagrams

### 01. Deployment Process

**File:** `01-deployment-process.puml`

Complete deployment workflow using AWS CDK, showing how code goes from developer workstation to production AWS infrastructure.

**Components:**

- Developer Workstation (Source Code, CDK CLI, npm)
- GitHub Repository
- CloudFormation
- S3 Buckets (CDK Assets, Frontend, Lambda Code)
- AWS Services (CloudFront, API Gateway, Lambda, Aurora, Cognito)

**Processes:**

- CDK Deployment (bootstrap, synth, diff, deploy)
- Frontend Deployment (build → S3 → CloudFront)
- Backend Deployment (build → ZIP → S3 → Lambda)
- Database Setup (migrations, seeds)

**View:** [PNG](Deployment%20Diagram.png) | [Source](01-deployment-process.puml)

---

[← Back to Diagrams](../README.md)
