# Infrastructure (AWS CDK)

This directory contains the AWS CDK infrastructure code for the Cost Control System.

## Architecture

The infrastructure is organized into 5 stacks:

1. **NetworkStack** - VPC, subnets, security groups
2. **DatabaseStack** - Aurora Serverless v2 PostgreSQL
3. **AuthStack** - Cognito User Pool for authentication
4. **ApiStack** - API Gateway + Lambda functions
5. **FrontendStack** - S3 + CloudFront for React app

## Prerequisites

- Node.js 24 LTS
- AWS CLI configured with credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Setup

```bash
# Install dependencies
npm install

# Bootstrap CDK (first time only)
npm run bootstrap

# Synthesize CloudFormation templates
npm run synth
```

## Deployment

### Development Environment

```bash
# Deploy all stacks
npm run deploy

# Deploy specific stack
npm run deploy:network
npm run deploy:database
npm run deploy:auth
npm run deploy:api
npm run deploy:frontend
```

### Production Environment

```bash
# Deploy to production
cdk deploy --all --context environment=prod

# Or specific stack
cdk deploy cost-control-prod-network --context environment=prod
```

## Configuration

Configuration is managed in `cdk.json` under the `context` section:

- **dev**: Development environment settings
- **prod**: Production environment settings

### Environment Variables

Set these environment variables before deployment:

```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

## Stack Details

### NetworkStack

Creates:

- VPC with public, private, and isolated subnets across 2 AZs
- NAT Gateway for private subnet internet access
- Security groups for Lambda and Database
- VPC endpoints for Secrets Manager

### DatabaseStack

Creates:

- Aurora Serverless v2 PostgreSQL cluster
- Database credentials in Secrets Manager
- Automatic backups (7 days dev, 30 days prod)
- CloudWatch Logs integration
- Performance Insights enabled

Configuration:

- Dev: 0.5-1 ACU
- Prod: 0.5-2 ACU

### AuthStack

Creates:

- Cognito User Pool with strict password policy
- User groups: Admin, ProjectManager, Viewer
- MFA support (TOTP)
- Email-based sign-in
- User Pool Client for frontend

### ApiStack

Creates:

- API Gateway REST API
- Cognito authorizer
- Lambda functions for API endpoints
- Shared Lambda layer for common code
- CloudWatch Logs and X-Ray tracing

### FrontendStack

Creates:

- S3 bucket for static assets
- CloudFront distribution
- Origin Access Identity for S3
- SPA routing support (404 → index.html)
- Frontend configuration file (config.json)

## Useful Commands

```bash
# Show differences between deployed and local
npm run diff

# Destroy all stacks (careful!)
npm run destroy

# List all stacks
cdk list

# View synthesized CloudFormation template
cdk synth NetworkStack

# Deploy with approval required
cdk deploy --require-approval=broadening
```

## Outputs

After deployment, CDK outputs important values:

- **NetworkStack**: VPC ID, Security Group IDs
- **DatabaseStack**: Cluster endpoint, Secret ARN
- **AuthStack**: User Pool ID, Client ID
- **ApiStack**: API URL, API ID
- **FrontendStack**: CloudFront URL, S3 bucket name

These outputs are exported and can be referenced by other stacks.

## Cost Optimization

- Aurora Serverless v2 scales to 0.5 ACU when idle
- Single NAT Gateway in dev (use 2+ in prod for HA)
- CloudFront PriceClass 100 in dev (all locations in prod)
- 7-day backups in dev, 30-day in prod
- Auto-delete S3 objects in dev

## Security

- Database in isolated subnet (no internet access)
- Lambda in private subnet with NAT Gateway
- Secrets Manager for database credentials
- Cognito for authentication
- API Gateway with Cognito authorizer
- CloudFront with HTTPS only
- Security groups with least privilege

## Monitoring

- CloudWatch Logs for all services
- X-Ray tracing enabled
- API Gateway metrics
- Database Performance Insights
- CloudWatch Alarms (TODO)

## Troubleshooting

### Bootstrap Error

```bash
# Bootstrap the environment
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Permission Errors

Ensure your AWS credentials have sufficient permissions:

- VPC, EC2, RDS, Cognito, API Gateway, Lambda, S3, CloudFront
- IAM role creation
- CloudFormation stack operations

### Stack Dependencies

Stacks must be deployed in order:

1. NetworkStack (no dependencies)
2. DatabaseStack (depends on Network)
3. AuthStack (no dependencies)
4. ApiStack (depends on Network, Database, Auth)
5. FrontendStack (depends on Auth, Api)

## Next Steps

1. Deploy infrastructure: `npm run deploy`
2. Run database migrations: `./database/scripts/migrate.sh`
3. Seed database: `./database/scripts/seed-db.sh`
4. Build and deploy Lambda functions
5. Build and deploy frontend
