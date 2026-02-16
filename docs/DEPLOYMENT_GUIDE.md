# Deployment Guide

Complete guide for deploying the Project Cost Control System to AWS.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Initial Deployment](#initial-deployment)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Deployment Process](#deployment-process)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

| Tool              | Version | Installation                 |
| ----------------- | ------- | ---------------------------- |
| Node.js           | 24.x    | `brew install node@24`       |
| npm               | 10.x    | Included with Node.js        |
| AWS CLI           | 2.x     | `brew install awscli`        |
| AWS CDK           | 2.x     | `npm install -g aws-cdk`     |
| PostgreSQL Client | 16.x    | `brew install postgresql@16` |
| Git               | Latest  | `brew install git`           |

### AWS Account Requirements

- AWS Account with admin access
- AWS CLI configured with credentials
- Sufficient service limits:
  - Lambda: 1000 concurrent executions
  - API Gateway: 10,000 requests/second
  - Aurora: 2 ACU max capacity

### Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "lambda:*",
        "apigateway:*",
        "rds:*",
        "cognito-idp:*",
        "iam:*",
        "secretsmanager:*",
        "cloudfront:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/project-cost-control.git
cd project-cost-control
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..

# Backend dependencies
cd backend
npm install
cd ..

# Infrastructure dependencies
cd infrastructure
npm install
cd ..
```

### 3. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Verify configuration
aws sts get-caller-identity
```

### 4. Bootstrap CDK

```bash
# Bootstrap CDK (first time only)
cd infrastructure
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example:
cdk bootstrap aws://123456789012/us-east-1
```

---

## Initial Deployment

### Step 1: Set Environment Variables

Create environment-specific context files:

**infrastructure/cdk.context.json**:

```json
{
  "dev": {
    "environment": "dev",
    "logLevel": "DEBUG",
    "auroraMinCapacity": 0.5,
    "auroraMaxCapacity": 1,
    "domainName": "dev.costcontrol.com"
  },
  "prod": {
    "environment": "prod",
    "logLevel": "INFO",
    "auroraMinCapacity": 0.5,
    "auroraMaxCapacity": 2,
    "domainName": "app.costcontrol.com"
  }
}
```

### Step 2: Deploy Infrastructure

```bash
cd infrastructure

# Synthesize CloudFormation templates
cdk synth

# Preview changes
cdk diff

# Deploy all stacks
cdk deploy --all --context environment=dev

# Or deploy specific stacks
cdk deploy NetworkStack --context environment=dev
cdk deploy DatabaseStack --context environment=dev
cdk deploy AuthStack --context environment=dev
cdk deploy ApiStack --context environment=dev
cdk deploy FrontendStack --context environment=dev
```

### Step 3: Note Output Values

CDK will output important values:

```
Outputs:
AuthStack.UserPoolId = us-east-1_abc123
AuthStack.UserPoolClientId = abc123def456
DatabaseStack.ClusterEndpoint = cluster.abc123.us-east-1.rds.amazonaws.com
ApiStack.ApiEndpoint = https://abc123.execute-api.us-east-1.amazonaws.com/prod
FrontendStack.CloudFrontUrl = https://d123abc.cloudfront.net
```

Save these values for configuration.

---

## Database Setup

### Step 1: Get Database Credentials

```bash
# Get secret ARN from CDK output
SECRET_ARN="arn:aws:secretsmanager:us-east-1:123456789012:secret:cost-control-db-credentials"

# Retrieve credentials
aws secretsmanager get-secret-value \
  --secret-id $SECRET_ARN \
  --query SecretString \
  --output text | jq -r
```

### Step 2: Connect to Database

```bash
# Get database endpoint from CDK output
DB_ENDPOINT="cluster.abc123.us-east-1.rds.amazonaws.com"

# Connect via bastion host or VPN
psql -h $DB_ENDPOINT -U dbadmin -d costcontrol
```

### Step 3: Run Migrations

```bash
cd database

# Set environment variables
export DB_HOST="cluster.abc123.us-east-1.rds.amazonaws.com"
export DB_PORT="5432"
export DB_NAME="costcontrol"
export DB_USER="dbadmin"
export DB_PASSWORD="<from-secrets-manager>"

# Run migrations
./scripts/migrate.sh

# Verify migrations
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"
```

### Step 4: Seed Initial Data (Optional)

```bash
# Seed cost codes, labor rates, etc.
./scripts/seed-db.sh
```

---

## Configuration

### Frontend Configuration

Create **frontend/.env.production**:

```bash
VITE_USER_POOL_ID=us-east-1_abc123
VITE_USER_POOL_CLIENT_ID=abc123def456
VITE_IDENTITY_POOL_ID=us-east-1:abc-123-def
VITE_API_ENDPOINT=https://abc123.execute-api.us-east-1.amazonaws.com/prod
VITE_AWS_REGION=us-east-1
```

### Backend Configuration

Backend configuration is managed via:

- Environment variables (set by CDK)
- Secrets Manager (database credentials)
- Parameter Store (future)

---

## Deployment Process

### Development Deployment

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Build backend
cd ../backend
npm run build

# 3. Deploy infrastructure
cd ../infrastructure
cdk deploy --all --context environment=dev

# 4. Upload frontend to S3
aws s3 sync ../frontend/dist s3://cost-control-dev-frontend --delete

# 5. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E123ABC \
  --paths "/*"
```

### Production Deployment

```bash
# 1. Create release branch
git checkout -b release/v1.0.0

# 2. Update version
npm version minor

# 3. Build and test
npm run build
npm run test

# 4. Deploy to production
cd infrastructure
cdk deploy --all --context environment=prod --require-approval never

# 5. Tag release
git tag v1.0.0
git push origin v1.0.0
```

### Automated Deployment (CI/CD)

**GitHub Actions** workflow:

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - "v*"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "24"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run tests
        run: npm run test

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy with CDK
        run: |
          cd infrastructure
          npm ci
          cdk deploy --all --context environment=prod --require-approval never
```

---

## Rollback Procedures

### Rollback Infrastructure

```bash
# List CloudFormation stacks
aws cloudformation list-stacks

# Rollback to previous version
aws cloudformation rollback-stack --stack-name ApiStack

# Or delete and redeploy
cdk destroy ApiStack
cdk deploy ApiStack --context environment=prod
```

### Rollback Frontend

```bash
# Restore previous S3 version
aws s3api list-object-versions \
  --bucket cost-control-prod-frontend \
  --prefix index.html

# Copy previous version
aws s3api copy-object \
  --bucket cost-control-prod-frontend \
  --copy-source cost-control-prod-frontend/index.html?versionId=VERSION_ID \
  --key index.html

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E123ABC \
  --paths "/*"
```

### Rollback Database

```bash
# Restore from snapshot
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier cost-control-prod-restored \
  --source-db-cluster-identifier cost-control-prod \
  --restore-to-time 2025-01-15T10:00:00Z

# Or restore from backup
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier cost-control-prod-restored \
  --snapshot-identifier cost-control-prod-snapshot-2025-01-15
```

---

## Troubleshooting

### Common Issues

#### 1. CDK Bootstrap Failed

**Error**: `CDK bootstrap failed: Access Denied`

**Solution**:

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Ensure you have admin permissions
aws iam get-user

# Try bootstrap with explicit credentials
cdk bootstrap --profile admin
```

#### 2. Lambda Function Timeout

**Error**: `Task timed out after 30.00 seconds`

**Solution**:

```typescript
// Increase timeout in CDK
new lambda.Function(this, "Function", {
  timeout: Duration.seconds(60), // Increase from 30
  // ...
});
```

#### 3. Database Connection Failed

**Error**: `ECONNREFUSED` or `Connection timeout`

**Solution**:

```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-abc123

# Verify Lambda is in VPC
aws lambda get-function-configuration --function-name projects-api

# Check database status
aws rds describe-db-clusters --db-cluster-identifier cost-control-prod
```

#### 4. CloudFront Not Serving Latest Files

**Error**: Old version of app still showing

**Solution**:

```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id E123ABC \
  --paths "/*"

# Wait for invalidation to complete
aws cloudfront get-invalidation \
  --distribution-id E123ABC \
  --id I123ABC
```

#### 5. Cognito User Pool Not Found

**Error**: `UserPoolId not found`

**Solution**:

```bash
# List user pools
aws cognito-idp list-user-pools --max-results 10

# Verify user pool ID in frontend config
cat frontend/.env.production | grep USER_POOL_ID
```

---

## Health Checks

### Post-Deployment Verification

```bash
# 1. Check API health
curl https://api.costcontrol.com/health

# 2. Check database connectivity
psql -h $DB_ENDPOINT -U dbadmin -d costcontrol -c "SELECT 1"

# 3. Check CloudFront
curl -I https://app.costcontrol.com

# 4. Check Lambda functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `cost-control`)].FunctionName'

# 5. Check CloudWatch logs
aws logs tail /aws/lambda/cost-control-prod-projects-api --follow
```

### Monitoring

```bash
# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=cost-control-prod-projects-api \
  --start-time 2025-01-15T00:00:00Z \
  --end-time 2025-01-15T23:59:59Z \
  --period 3600 \
  --statistics Sum

# View recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/cost-control-prod-projects-api \
  --filter-pattern "ERROR"
```

---

## Maintenance

### Regular Tasks

**Daily**:

- Monitor CloudWatch alarms
- Review error logs
- Check database performance

**Weekly**:

- Review CloudWatch metrics
- Check cost reports
- Update dependencies (security patches)

**Monthly**:

- Review and optimize costs
- Update documentation
- Rotate secrets
- Review access logs

### Backup Verification

```bash
# List recent backups
aws rds describe-db-cluster-snapshots \
  --db-cluster-identifier cost-control-prod

# Test restore (in dev)
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier cost-control-dev-test \
  --snapshot-identifier cost-control-prod-snapshot-latest
```

---

## Security Checklist

Before production deployment:

- [ ] All secrets in Secrets Manager (no hardcoded credentials)
- [ ] MFA enabled for admin users
- [ ] Database in private subnet
- [ ] HTTPS enforced everywhere
- [ ] CloudWatch alarms configured
- [ ] Backup retention set to 7 days
- [ ] IAM roles follow least privilege
- [ ] Security groups properly configured
- [ ] CloudFront using HTTPS only
- [ ] API Gateway rate limiting enabled

---

## Support

For deployment issues:

- Check [Troubleshooting](#troubleshooting) section
- Review CloudWatch logs
- Contact DevOps team
- Create GitHub issue

## References

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Architecture Decision Records](ARCHITECTURE_DECISION_RECORDS.md)
