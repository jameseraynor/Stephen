---
inclusion: always
---

# AWS CDK Patterns & Conventions

This document defines patterns and conventions for AWS CDK infrastructure code in this project.

## Stack Organization

### Stack Structure

```
infrastructure/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   ├── network-stack.ts    # VPC, subnets, security groups
│   ├── database-stack.ts   # Aurora Serverless v2
│   ├── auth-stack.ts       # Cognito User Pool
│   ├── api-stack.ts        # API Gateway + Lambda functions
│   └── frontend-stack.ts   # S3 + CloudFront
└── lambda/
    ├── projects/
    ├── budget/
    ├── actuals/
    └── shared/             # Shared utilities
```

### Stack Dependencies

```typescript
// Correct order
const networkStack = new NetworkStack(app, "NetworkStack");
const databaseStack = new DatabaseStack(app, "DatabaseStack", {
  vpc: networkStack.vpc,
});
const authStack = new AuthStack(app, "AuthStack");
const apiStack = new ApiStack(app, "ApiStack", {
  vpc: networkStack.vpc,
  database: databaseStack.cluster,
  userPool: authStack.userPool,
});
```

## Naming Conventions

### Resource Naming Pattern

```
{project}-{environment}-{resource-type}-{name}
```

Examples:

```typescript
// ✅ Good
const bucket = new s3.Bucket(this, "FrontendBucket", {
  bucketName: "cost-control-prod-frontend-assets",
});

const table = new dynamodb.Table(this, "ProjectsTable", {
  tableName: "cost-control-prod-projects",
});

// ❌ Bad
const bucket = new s3.Bucket(this, "Bucket1");
const table = new dynamodb.Table(this, "MyTable");
```

### Lambda Function Naming

```typescript
// Pattern: {domain}-{action}
const createProjectFn = new lambda.Function(this, "CreateProjectFunction", {
  functionName: "cost-control-prod-projects-create",
  handler: "projects/create.handler",
  // ...
});
```

## Aurora Serverless v2 Configuration

```typescript
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";

const cluster = new rds.DatabaseCluster(this, "Database", {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_16_6,
  }),
  serverlessV2MinCapacity: 0.5, // Scale to zero
  serverlessV2MaxCapacity: 2, // Max for MVP
  writer: rds.ClusterInstance.serverlessV2("writer"),
  vpc: props.vpc,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
  },
  defaultDatabaseName: "costcontrol",
  credentials: rds.Credentials.fromGeneratedSecret("dbadmin", {
    secretName: "cost-control-prod-db-credentials",
  }),
  backup: {
    retention: Duration.days(7),
  },
  removalPolicy: RemovalPolicy.SNAPSHOT, // Safety for prod
});
```

## RDS Proxy (Connection Pooling)

RDS Proxy manages connection pooling centrally for all Lambda functions. Lambda connects to the proxy endpoint instead of directly to Aurora.

```typescript
import * as rds from "aws-cdk-lib/aws-rds";

// Create RDS Proxy
const proxy = new rds.DatabaseProxy(this, "DatabaseProxy", {
  proxyTarget: rds.ProxyTarget.fromCluster(cluster),
  secrets: [cluster.secret!],
  vpc: props.vpc,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
  },
  securityGroups: [props.lambdaSecurityGroup],
  requireTLS: true,
  dbProxyName: "cost-control-prod-db-proxy",

  // Idle client timeout (Lambda containers)
  idleClientTimeout: Duration.minutes(30),
});

// Allow proxy to connect to Aurora
cluster.connections.allowFrom(
  proxy,
  ec2.Port.tcp(5432),
  "Allow RDS Proxy to Aurora",
);

// Pass proxy endpoint to Lambda (not the Aurora cluster endpoint)
const fn = new lambda.Function(this, "Function", {
  environment: {
    RDS_PROXY_ENDPOINT: proxy.endpoint,
    DATABASE_SECRET_ARN: cluster.secret!.secretArn,
  },
});

// Grant Lambda access to the proxy
proxy.grantConnect(fn, "dbadmin");
```

### Why RDS Proxy

- Centralizes connection pooling across all Lambda invocations
- Prevents connection exhaustion (Lambda can spawn hundreds of containers)
- Handles automatic failover to Aurora replicas
- Supports credential rotation via Secrets Manager
- Lambda uses `pg.Client` (single connection) instead of `pg.Pool`

## Lambda Configuration

### Standard Lambda Setup

```typescript
const fn = new lambda.Function(this, "Function", {
  runtime: lambda.Runtime.NODEJS_24_X,
  handler: "index.handler",
  code: lambda.Code.fromAsset("lambda/dist"),
  timeout: Duration.seconds(30),
  memorySize: 512,
  environment: {
    // Database (via RDS Proxy)
    DATABASE_SECRET_ARN: props.databaseSecret.secretArn,
    RDS_PROXY_ENDPOINT: props.rdsProxy.endpoint,
    // AWS Lambda Powertools
    POWERTOOLS_SERVICE_NAME: "cost-control-api",
    POWERTOOLS_LOG_LEVEL: config.logLevel,
    POWERTOOLS_LOGGER_SAMPLE_RATE: "0.1",
    POWERTOOLS_METRICS_NAMESPACE: "CostControl",
    // App
    NODE_ENV: "production",
  },
  vpc: props.vpc,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
  },
  // Enable X-Ray tracing for Powertools Tracer
  tracing: lambda.Tracing.ACTIVE,
});

// Grant permissions
props.databaseSecret.grantRead(fn);
props.rdsProxy.grantConnect(fn, "dbadmin");
```

### Lambda Layers for Shared Code

```typescript
const sharedLayer = new lambda.LayerVersion(this, "SharedLayer", {
  code: lambda.Code.fromAsset("lambda/layers/shared"),
  compatibleRuntimes: [lambda.Runtime.NODEJS_24_X],
  description: "Shared utilities and database client",
});

const fn = new lambda.Function(this, "Function", {
  // ...
  layers: [sharedLayer],
});
```

## API Gateway Configuration

```typescript
import * as apigateway from "aws-cdk-lib/aws-apigateway";

const api = new apigateway.RestApi(this, "Api", {
  restApiName: "cost-control-api",
  description: "Project Cost Control API",
  deployOptions: {
    stageName: "prod",
    throttlingRateLimit: 100,
    throttlingBurstLimit: 200,
    loggingLevel: apigateway.MethodLoggingLevel.INFO,
    dataTraceEnabled: true,
  },
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS, // Restrict in prod
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ["Content-Type", "Authorization"],
  },
});

// Cognito Authorizer
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
  this,
  "Authorizer",
  {
    cognitoUserPools: [props.userPool],
    authorizerName: "CognitoAuthorizer",
  },
);

// Protected endpoint
const projects = api.root.addResource("projects");
projects.addMethod("GET", new apigateway.LambdaIntegration(listProjectsFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

## Secrets Management

```typescript
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

// Database credentials (auto-generated)
const dbSecret = new secretsmanager.Secret(this, "DBSecret", {
  secretName: "cost-control-prod-db-credentials",
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ username: "dbadmin" }),
    generateStringKey: "password",
    excludePunctuation: true,
    includeSpace: false,
  },
});

// External API keys (manual)
const apiKeySecret = new secretsmanager.Secret(this, "ApiKeySecret", {
  secretName: "cost-control-prod-external-api-key",
  description: "API key for external service integration",
});

// Grant Lambda access
dbSecret.grantRead(lambdaFunction);
```

## CloudFront + S3 for Frontend

```typescript
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

const bucket = new s3.Bucket(this, "FrontendBucket", {
  bucketName: "cost-control-prod-frontend",
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED,
  removalPolicy: RemovalPolicy.RETAIN,
});

const oai = new cloudfront.OriginAccessIdentity(this, "OAI");
bucket.grantRead(oai);

const distribution = new cloudfront.Distribution(this, "Distribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket, {
      originAccessIdentity: oai,
    }),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
  },
  defaultRootObject: "index.html",
  errorResponses: [
    {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: "/index.html", // SPA routing
      ttl: Duration.seconds(0),
    },
  ],
});
```

## Environment Variables

```typescript
// ✅ Good - Use CDK context
const environment = this.node.tryGetContext("environment") || "dev";
const config = this.node.tryGetContext(environment);

// Pass to Lambda
const fn = new lambda.Function(this, "Function", {
  environment: {
    ENVIRONMENT: environment,
    LOG_LEVEL: config.logLevel,
    DATABASE_SECRET_ARN: dbSecret.secretArn,
  },
});

// ❌ Bad - Hardcoded values
const fn = new lambda.Function(this, "Function", {
  environment: {
    DATABASE_URL: "postgres://user:pass@host/db", // Never!
  },
});
```

## CDK Context (cdk.json)

```json
{
  "app": "npx ts-node bin/app.ts",
  "context": {
    "dev": {
      "logLevel": "DEBUG",
      "auroraMinCapacity": 0.5,
      "auroraMaxCapacity": 1
    },
    "prod": {
      "logLevel": "INFO",
      "auroraMinCapacity": 0.5,
      "auroraMaxCapacity": 2
    }
  }
}
```

## Tagging Strategy

```typescript
import * as cdk from "aws-cdk-lib";

// Apply to all resources in stack
cdk.Tags.of(this).add("Project", "CostControl");
cdk.Tags.of(this).add("Environment", environment);
cdk.Tags.of(this).add("ManagedBy", "CDK");
cdk.Tags.of(this).add("CostCenter", "Engineering");
```

## Testing CDK Code

```typescript
// infrastructure/test/database-stack.test.ts
import { Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import { DatabaseStack } from "../lib/database-stack";

test("Aurora Cluster Created", () => {
  const app = new cdk.App();
  const stack = new DatabaseStack(app, "TestStack", {
    vpc: mockVpc,
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::RDS::DBCluster", {
    Engine: "aurora-postgresql",
    ServerlessV2ScalingConfiguration: {
      MinCapacity: 0.5,
      MaxCapacity: 2,
    },
  });
});
```

## Deployment Commands

```bash
# Synthesize CloudFormation
npm run cdk synth

# Diff against deployed stack
npm run cdk diff

# Deploy all stacks
npm run cdk deploy --all

# Deploy specific stack
npm run cdk deploy DatabaseStack

# Destroy (careful!)
npm run cdk destroy --all
```

## Common Pitfalls

❌ **Don't:**

- Hardcode credentials or secrets
- Use default removal policies (can delete data)
- Create resources without tags
- Ignore CDK best practices warnings

✅ **Do:**

- Use Secrets Manager for sensitive data
- Set explicit removal policies
- Tag all resources
- Use CDK constructs over raw CloudFormation
- Keep stacks focused and modular
