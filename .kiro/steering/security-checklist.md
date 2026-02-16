# Security Checklist

This document defines security best practices and requirements for the application.

## Authentication & Authorization

### Cognito User Pool Configuration

```typescript
// infrastructure/lib/auth-stack.ts
import * as cognito from 'aws-cdk-lib/aws-cognito';

const userPool = new cognito.UserPool(this, 'UserPool', {
  userPoolName: 'cost-control-users',
  
  // Self-registration disabled (admin creates users)
  selfSignUpEnabled: false,
  
  // Sign-in options
  signInAliases: {
    email: true,
    username: false
  },
  
  // Password policy
  passwordPolicy: {
    minLength: 12,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: true,
    tempPasswordValidity: Duration.days(3)
  },
  
  // Account recovery
  accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
  
  // MFA configuration
  mfa: cognito.Mfa.OPTIONAL,
  mfaSecondFactor: {
    sms: false,
    otp: true  // TOTP only
  },
  
  // Email settings
  email: cognito.UserPoolEmail.withSES({
    fromEmail: 'noreply@costcontrol.com',
    fromName: 'Cost Control System',
    sesRegion: 'us-east-1'
  }),
  
  // Advanced security
  advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
  
  // User attributes
  standardAttributes: {
    email: {
      required: true,
      mutable: false
    },
    givenName: {
      required: true,
      mutable: true
    },
    familyName: {
      required: true,
      mutable: true
    }
  },
  
  customAttributes: {
    'role': new cognito.StringAttribute({ mutable: true })
  },
  
  // Deletion protection
  removalPolicy: RemovalPolicy.RETAIN
});
```

### Cognito Groups (Roles)

```typescript
// Create user groups for RBAC
const adminGroup = new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
  userPoolId: userPool.userPoolId,
  groupName: 'Admin',
  description: 'Full system access',
  precedence: 1
});

const projectManagerGroup = new cognito.CfnUserPoolGroup(this, 'ProjectManagerGroup', {
  userPoolId: userPool.userPoolId,
  groupName: 'ProjectManager',
  description: 'Can manage assigned projects',
  precedence: 2
});

const viewerGroup = new cognito.CfnUserPoolGroup(this, 'ViewerGroup', {
  userPoolId: userPool.userPoolId,
  groupName: 'Viewer',
  description: 'Read-only access',
  precedence: 3
});
```

### Microsoft SSO Integration

```typescript
// Add Azure AD as identity provider
const azureProvider = new cognito.UserPoolIdentityProviderSaml(this, 'AzureAD', {
  userPool,
  name: 'AzureAD',
  metadata: cognito.UserPoolIdentityProviderSamlMetadata.url(
    'https://login.microsoftonline.com/{tenant-id}/federationmetadata/2007-06/federationmetadata.xml'
  ),
  attributeMapping: {
    email: cognito.ProviderAttribute.other('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'),
    givenName: cognito.ProviderAttribute.other('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'),
    familyName: cognito.ProviderAttribute.other('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')
  }
});

// Update user pool client to support SSO
const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
  userPool,
  supportedIdentityProviders: [
    cognito.UserPoolClientIdentityProvider.COGNITO,
    cognito.UserPoolClientIdentityProvider.custom('AzureAD')
  ],
  oAuth: {
    flows: {
      authorizationCodeGrant: true
    },
    scopes: [
      cognito.OAuthScope.EMAIL,
      cognito.OAuthScope.OPENID,
      cognito.OAuthScope.PROFILE
    ],
    callbackUrls: [
      'https://app.costcontrol.com/callback',
      'http://localhost:5173/callback'  // Dev only
    ],
    logoutUrls: [
      'https://app.costcontrol.com',
      'http://localhost:5173'  // Dev only
    ]
  }
});
```

### MFA Enforcement

```typescript
// Lambda trigger to enforce MFA for Admin users
export async function handler(event: PreAuthenticationTriggerEvent) {
  const userGroups = event.request.userAttributes['cognito:groups']?.split(',') || [];
  const mfaEnabled = event.request.userAttributes['phone_number_verified'] === 'true' ||
                     event.request.userAttributes['software_token_mfa_enabled'] === 'true';
  
  // Require MFA for Admin users
  if (userGroups.includes('Admin') && !mfaEnabled) {
    throw new Error('MFA is required for Admin users');
  }
  
  return event;
}
```

## API Gateway Security

### Cognito Authorizer

```typescript
// infrastructure/lib/api-stack.ts
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

const api = new apigateway.RestApi(this, 'Api', {
  restApiName: 'cost-control-api',
  
  // Deploy options
  deployOptions: {
    stageName: 'prod',
    
    // Throttling
    throttlingRateLimit: 100,      // Requests per second
    throttlingBurstLimit: 200,     // Burst capacity
    
    // Logging
    loggingLevel: apigateway.MethodLoggingLevel.INFO,
    dataTraceEnabled: false,  // Don't log request/response bodies (may contain sensitive data)
    
    // Metrics
    metricsEnabled: true,
    
    // Tracing
    tracingEnabled: true
  },
  
  // CORS (restrict in production)
  defaultCorsPreflightOptions: {
    allowOrigins: ['https://app.costcontrol.com'],  // Specific domain only
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Amz-Date',
      'X-Api-Key',
      'X-Amz-Security-Token'
    ],
    allowCredentials: true,
    maxAge: Duration.hours(1)
  },
  
  // CloudWatch role
  cloudWatchRole: true
});

// Create Cognito authorizer
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
  cognitoUserPools: [props.userPool],
  authorizerName: 'CognitoAuthorizer',
  identitySource: 'method.request.header.Authorization'
});

// Apply to all endpoints
const projects = api.root.addResource('projects');
projects.addMethod('GET', new apigateway.LambdaIntegration(listProjectsFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
  
  // Request validation
  requestValidator: new apigateway.RequestValidator(this, 'RequestValidator', {
    api,
    validateRequestBody: true,
    validateRequestParameters: true
  })
});
```

### API Key for Internal Services (Optional)

```typescript
// For service-to-service communication
const apiKey = api.addApiKey('InternalApiKey', {
  apiKeyName: 'cost-control-internal',
  description: 'API key for internal service communication'
});

const usagePlan = api.addUsagePlan('UsagePlan', {
  name: 'InternalUsagePlan',
  throttle: {
    rateLimit: 1000,
    burstLimit: 2000
  },
  quota: {
    limit: 100000,
    period: apigateway.Period.DAY
  }
});

usagePlan.addApiKey(apiKey);
usagePlan.addApiStage({
  stage: api.deploymentStage
});
```

## Lambda Security

### IAM Roles & Permissions

```typescript
// Least privilege principle
const lambdaRole = new iam.Role(this, 'LambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
  ]
});

// Grant specific permissions only
props.databaseSecret.grantRead(lambdaRole);
props.table.grantReadWriteData(lambdaRole);

// Don't grant broad permissions
// ❌ Bad
lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
```

### Environment Variables

```typescript
// ✅ Good - Use Secrets Manager for sensitive data
const fn = new lambda.Function(this, 'Function', {
  environment: {
    DATABASE_SECRET_ARN: props.databaseSecret.secretArn,
    TABLE_NAME: props.table.tableName,
    NODE_ENV: 'production',
    LOG_LEVEL: 'INFO'
  }
});

// ❌ Bad - Never hardcode credentials
const fn = new lambda.Function(this, 'Function', {
  environment: {
    DATABASE_URL: 'postgres://user:password@host/db',  // NEVER!
    API_KEY: 'sk_live_abc123'  // NEVER!
  }
});
```

### Lambda Function Configuration

```typescript
const fn = new lambda.Function(this, 'Function', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda/dist'),
  
  // Security
  vpc: props.vpc,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
  },
  securityGroups: [props.lambdaSecurityGroup],
  
  // Resource limits
  timeout: Duration.seconds(30),
  memorySize: 512,
  
  // Reserved concurrency (prevent runaway costs)
  reservedConcurrentExecutions: 10,
  
  // Tracing
  tracing: lambda.Tracing.ACTIVE,
  
  // Environment
  environment: {
    NODE_OPTIONS: '--enable-source-maps',
    DATABASE_SECRET_ARN: props.databaseSecret.secretArn
  }
});
```

## Database Security

### Aurora Security Configuration

```typescript
const cluster = new rds.DatabaseCluster(this, 'Database', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_3
  }),
  
  // Network isolation
  vpc: props.vpc,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PRIVATE_ISOLATED  // No internet access
  },
  
  // Security group
  securityGroups: [dbSecurityGroup],
  
  // Credentials from Secrets Manager
  credentials: rds.Credentials.fromGeneratedSecret('dbadmin', {
    secretName: 'cost-control-db-credentials',
    encryptionKey: props.kmsKey  // Customer-managed KMS key
  }),
  
  // Encryption at rest
  storageEncrypted: true,
  storageEncryptionKey: props.kmsKey,
  
  // Backup
  backup: {
    retention: Duration.days(7),
    preferredWindow: '03:00-04:00'
  },
  
  // Deletion protection
  deletionProtection: true,
  removalPolicy: RemovalPolicy.SNAPSHOT,
  
  // Monitoring
  cloudwatchLogsExports: ['postgresql'],
  cloudwatchLogsRetention: logs.RetentionDays.ONE_MONTH
});
```

### Security Groups

```typescript
// Database security group
const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
  vpc: props.vpc,
  description: 'Security group for Aurora database',
  allowAllOutbound: false
});

// Lambda security group
const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
  vpc: props.vpc,
  description: 'Security group for Lambda functions'
});

// Allow Lambda to access database
dbSecurityGroup.addIngressRule(
  lambdaSecurityGroup,
  ec2.Port.tcp(5432),
  'Allow Lambda access to database'
);

// Allow Lambda to access Secrets Manager (via VPC endpoint)
const secretsManagerEndpoint = new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
  vpc: props.vpc,
  service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
  securityGroups: [lambdaSecurityGroup]
});
```

### Database User Permissions

```sql
-- Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'generated_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE costcontrol TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Don't grant DDL permissions to application user
-- REVOKE CREATE ON SCHEMA public FROM app_user;
```

## Secrets Management

### Using Secrets Manager

```typescript
// Lambda function accessing secrets
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({});

export async function getDbCredentials() {
  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.DATABASE_SECRET_ARN
    })
  );
  
  return JSON.parse(response.SecretString!);
}

// Cache credentials (Lambda container reuse)
let cachedCredentials: any = null;

export async function getDbCredentialsCached() {
  if (!cachedCredentials) {
    cachedCredentials = await getDbCredentials();
  }
  return cachedCredentials;
}
```

### Rotating Secrets

```typescript
// Enable automatic rotation
const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
  secretName: 'cost-control-db-credentials',
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ username: 'dbadmin' }),
    generateStringKey: 'password',
    excludePunctuation: true,
    includeSpace: false,
    passwordLength: 32
  }
});

// Rotate every 30 days
dbSecret.addRotationSchedule('RotationSchedule', {
  automaticallyAfter: Duration.days(30)
});
```

## Frontend Security

### Amplify Configuration

```typescript
// src/aws-config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
      
      // MFA configuration
      mfa: {
        status: 'optional',
        totpEnabled: true,
        smsEnabled: false
      },
      
      // Password policy (matches Cognito)
      passwordFormat: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true
      }
    }
  },
  API: {
    REST: {
      'api': {
        endpoint: import.meta.env.VITE_API_ENDPOINT,
        region: import.meta.env.VITE_AWS_REGION
      }
    }
  }
});
```

### Environment Variables

```bash
# .env.production (never commit!)
VITE_USER_POOL_ID=us-east-1_abc123
VITE_USER_POOL_CLIENT_ID=abc123def456
VITE_IDENTITY_POOL_ID=us-east-1:abc-123-def
VITE_API_ENDPOINT=https://api.costcontrol.com
VITE_AWS_REGION=us-east-1

# .env.example (commit this)
VITE_USER_POOL_ID=your_user_pool_id
VITE_USER_POOL_CLIENT_ID=your_client_id
VITE_IDENTITY_POOL_ID=your_identity_pool_id
VITE_API_ENDPOINT=your_api_endpoint
VITE_AWS_REGION=us-east-1
```

### Content Security Policy

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          '<head>',
          `<head>
            <meta http-equiv="Content-Security-Policy" content="
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              connect-src 'self' https://*.amazonaws.com https://cognito-idp.*.amazonaws.com;
              frame-ancestors 'none';
              base-uri 'self';
              form-action 'self';
            ">`
        );
      }
    }
  ]
});
```

### XSS Prevention

```typescript
// ✅ Good - React automatically escapes
function ProjectCard({ project }: ProjectCardProps) {
  return <div>{project.name}</div>;  // Safe
}

// ❌ Bad - dangerouslySetInnerHTML
function ProjectCard({ project }: ProjectCardProps) {
  return <div dangerouslySetInnerHTML={{ __html: project.name }} />;  // Unsafe!
}

// ✅ Good - Sanitize if HTML is needed
import DOMPurify from 'dompurify';

function ProjectCard({ project }: ProjectCardProps) {
  const sanitized = DOMPurify.sanitize(project.description);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

## Input Validation

### Frontend Validation

```typescript
// Use Zod for validation
import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(1).max(255),
  jobNumber: z.string().regex(/^\d{2}[A-Z]{3}\d{4}$/),
  contractAmount: z.number().positive().max(999999999.99),
  budgetedGpPct: z.number().min(0).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Validate before API call
function handleSubmit(data: unknown) {
  try {
    const validated = ProjectSchema.parse(data);
    await projectsApi.create(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Show validation errors
    }
  }
}
```

### Backend Validation

```typescript
// Lambda handler validation
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  jobNumber: z.string().regex(/^\d{2}[A-Z]{3}\d{4}$/),
  contractAmount: z.number().positive(),
  budgetedGpPct: z.number().min(0).max(100)
});

export async function handler(event: APIGatewayProxyEvent) {
  try {
    // Parse and validate
    const body = JSON.parse(event.body || '{}');
    const validated = CreateProjectSchema.parse(body);
    
    // Process request
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors
          }
        })
      };
    }
    throw error;
  }
}
```

## Logging & Monitoring

### CloudWatch Logs

```typescript
// Lambda logging (never log sensitive data)
export async function handler(event: APIGatewayProxyEvent) {
  // ✅ Good - Log request metadata
  console.log('Processing request', {
    requestId: event.requestContext.requestId,
    path: event.path,
    method: event.httpMethod,
    userId: event.requestContext.authorizer?.claims.sub
  });
  
  // ❌ Bad - Don't log sensitive data
  console.log('Request body:', event.body);  // May contain passwords, tokens, etc.
  console.log('Authorization header:', event.headers.Authorization);  // Never!
}
```

### CloudWatch Alarms

```typescript
// Alert on high error rates
const errorAlarm = new cloudwatch.Alarm(this, 'ApiErrorAlarm', {
  metric: api.metricServerError(),
  threshold: 10,
  evaluationPeriods: 2,
  datapointsToAlarm: 2,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
});

errorAlarm.addAlarmAction(new actions.SnsAction(props.alertTopic));

// Alert on unauthorized access attempts
const unauthorizedAlarm = new cloudwatch.Alarm(this, 'UnauthorizedAlarm', {
  metric: api.metricClientError({
    statistic: 'Sum'
  }),
  threshold: 50,
  evaluationPeriods: 1
});
```

## Security Checklist

### Pre-Deployment

- [ ] All secrets stored in Secrets Manager (no hardcoded credentials)
- [ ] MFA enabled for Admin users
- [ ] API Gateway has Cognito authorizer on all endpoints
- [ ] CORS configured with specific origins (not *)
- [ ] Database in private subnet with no public access
- [ ] Lambda functions in VPC with security groups
- [ ] IAM roles follow least privilege principle
- [ ] CloudWatch logging enabled (without sensitive data)
- [ ] Encryption at rest enabled (database, S3)
- [ ] Encryption in transit enforced (HTTPS only)
- [ ] Input validation on frontend and backend
- [ ] Rate limiting configured on API Gateway
- [ ] CloudWatch alarms configured for security events

### Post-Deployment

- [ ] Review CloudWatch logs for errors
- [ ] Test authentication flows (login, MFA, SSO)
- [ ] Verify authorization (users can only access permitted resources)
- [ ] Test rate limiting
- [ ] Verify CORS configuration
- [ ] Check CloudWatch alarms are working
- [ ] Review IAM permissions
- [ ] Test secret rotation
- [ ] Verify backup/restore procedures

### Ongoing

- [ ] Review CloudWatch logs weekly
- [ ] Rotate secrets every 30 days
- [ ] Review IAM permissions monthly
- [ ] Update dependencies for security patches
- [ ] Review CloudWatch alarms monthly
- [ ] Conduct security audit quarterly
- [ ] Review user access quarterly
- [ ] Test disaster recovery annually
