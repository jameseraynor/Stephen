# CDK Stacks Review

## ✅ Successful Synthesis

All 5 CDK stacks synthesized successfully:

```bash
✅ cost-control-dev-network      (20.9 KB CloudFormation)
✅ cost-control-dev-database     (11.1 KB CloudFormation)
✅ cost-control-dev-auth         (6.2 KB CloudFormation)
✅ cost-control-dev-api          (6.8 KB CloudFormation)
✅ cost-control-dev-frontend     (16.2 KB CloudFormation)
```

## How to Review the Stacks

### 1. View the CloudFormation template for a specific stack

```bash
cd infrastructure

# View NetworkStack
npx cdk synth cost-control-dev-network

# View DatabaseStack
npx cdk synth cost-control-dev-database

# View AuthStack
npx cdk synth cost-control-dev-auth
```

### 2. View the resources that would be created

```bash
# List all resources from all stacks
npx cdk synth --all | grep "Type: AWS::"

# Or view a specific stack
npx cdk synth cost-control-dev-network | grep "Type: AWS::"
```

### 3. View differences (if already deployed)

```bash
# See what would change if you deploy
npx cdk diff cost-control-dev-network
```

## Resource Summary by Stack

### NetworkStack

- **VPC** with 6 subnets (2 AZs × 3 types)
  - 2 Public subnets
  - 2 Private subnets (with NAT Gateway)
  - 2 Isolated subnets (no internet)
- **1 NAT Gateway** (for cost optimization in dev)
- **2 Security Groups**:
  - Lambda Security Group
  - Database Security Group
- **1 VPC Endpoint** (Secrets Manager)
- **Internet Gateway**
- **Route Tables** and associations

### DatabaseStack

- **Aurora Serverless v2 Cluster** (PostgreSQL 16.6)
  - Min capacity: 0.5 ACU
  - Max capacity: 1 ACU (dev)
  - 1 Writer instance
- **Secrets Manager Secret** (database credentials)
- **Security Group** for database
- **CloudWatch Log Group** (PostgreSQL logs)
- **Backup configuration** (7 days)

### AuthStack

- **Cognito User Pool**
  - Password policy (12+ chars, complex)
  - Optional MFA (TOTP)
  - Email sign-in
  - Advanced security mode
- **3 User Groups**:
  - Admin (precedence 1)
  - ProjectManager (precedence 2)
  - Viewer (precedence 3)
- **User Pool Client**
  - OAuth flows configured
  - Token validity (1h access, 30d refresh)

### ApiStack

- **API Gateway REST API**
  - CORS configured
  - Throttling (100 req/s, burst 200)
  - CloudWatch Logs
  - X-Ray tracing
- **CloudWatch Role** for API Gateway
- Note: Lambda functions are commented out until the backend is built

### FrontendStack

- **S3 Bucket** (private)
  - Block all public access
  - S3-managed encryption
- **CloudFront Distribution**
  - HTTPS only
  - SPA routing (404 → index.html)
  - Gzip compression
  - Price Class 100 (dev)
- **Origin Access Identity**
- **S3 Deployment** (config.json)

## Warnings (Non-Critical)

The warnings you see are normal:

1. **advancedSecurityMode deprecated**: AWS recommends using the new protection modes. We can update later.

2. **S3Origin deprecated**: AWS recommends using `S3BucketOrigin`. We can update later.

3. **CDK telemetry**: Information about CDK CLI telemetry. You can disable it with:
   ```bash
   cdk acknowledge 34892
   ```

## Next Steps for Deployment

### Option 1: Deploy Everything (Recommended for first time)

```bash
# 1. Configure AWS credentials
export AWS_PROFILE=your-profile
# or
aws configure

# 2. Bootstrap CDK (first time only)
npx cdk bootstrap

# 3. Deploy all stacks
npx cdk deploy --all

# You will be asked for confirmation for each stack
# Review the changes and confirm with 'y'
```

### Option 2: Deploy Stack by Stack

```bash
# 1. Network (no dependencies)
npx cdk deploy cost-control-dev-network

# 2. Database (depends on Network)
npx cdk deploy cost-control-dev-database

# 3. Auth (no dependencies)
npx cdk deploy cost-control-dev-auth

# 4. API (depends on Network, Database, Auth)
npx cdk deploy cost-control-dev-api

# 5. Frontend (depends on Auth, API)
npx cdk deploy cost-control-dev-frontend
```

### Option 3: Review Only (Without Deploying)

```bash
# See what would be created without deploying
npx cdk synth --all > review.yaml

# View estimated costs (requires AWS Cost Explorer)
# Not available directly in CDK, but you can use:
# https://calculator.aws/
```

## Estimated Costs (Dev Environment)

Based on the current configuration:

- **VPC**: Free (only NAT Gateway incurs charges)
- **NAT Gateway**: ~$32/month + data transfer
- **Aurora Serverless v2**: ~$43/month (0.5 ACU × 24h × 30d × $0.12/ACU-hour)
- **Cognito**: Free (first 50,000 MAU)
- **API Gateway**: Free (first million requests)
- **Lambda**: Free (first million requests)
- **S3**: ~$0.50/month (minimum storage)
- **CloudFront**: Free (first TB of data transfer)

**Estimated total**: ~$75-80/month for dev

To reduce costs in dev:

- Shut down Aurora when not in use
- Use VPC without NAT Gateway (temporary public access)
- Use LocalStack for local development

## Verify Before Deploying

- [ ] AWS credentials configured
- [ ] Correct region (us-east-1 by default)
- [ ] AWS budget configured (optional but recommended)
- [ ] Review generated templates
- [ ] Understand estimated costs

## Useful Commands

```bash
# View all stacks
npx cdk list

# View template for a stack
npx cdk synth cost-control-dev-network

# View differences (if already deployed)
npx cdk diff

# Destroy all stacks (BE CAREFUL!)
npx cdk destroy --all

# View stack metadata
npx cdk metadata
```

## Important Notes

1. **Lambda Functions**: They are commented out in ApiStack because the backend is not built yet. We will uncomment them when the Lambda code is ready.

2. **Cognito Authorizer**: Also temporarily commented out. It will be activated when we have the Lambda functions.

3. **Database**: Aurora Serverless v2 can scale down to 0.5 ACU when idle, but not to 0. There is always a base cost.

4. **Deletion Protection**: Disabled in dev to facilitate testing. It will be enabled in prod.

5. **Backups**: 7 days in dev, 30 days in prod.

## Troubleshooting

### Error: "Unable to resolve AWS account"

```bash
aws sts get-caller-identity
# Verify that your credentials are configured
```

### Error: "CDK bootstrap required"

```bash
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Error: "Stack already exists"

```bash
# View the existing stack
npx cdk diff cost-control-dev-network

# Destroy and recreate
npx cdk destroy cost-control-dev-network
npx cdk deploy cost-control-dev-network
```

## Next Step

Once you have reviewed the stacks, you can:

1. **Deploy the infrastructure** (if you have AWS configured)
2. **Continue with item 5**: Base UI Components (shadcn/ui)
3. **Continue with item 7**: Lambda Functions Scaffold
