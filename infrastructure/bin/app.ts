#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NetworkStack } from "../lib/network-stack";
import { DatabaseStack } from "../lib/database-stack";
import { AuthStack } from "../lib/auth-stack";
import { ApiStack } from "../lib/api-stack";
import { FrontendStack } from "../lib/frontend-stack";

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext("environment") || "dev";
const config = app.node.tryGetContext(environment);

if (!config) {
  throw new Error(
    `Configuration for environment '${environment}' not found in cdk.json`,
  );
}

// Stack naming convention: cost-control-{env}-{stack}
const stackPrefix = `cost-control-${environment}`;

// Tags applied to all resources
const tags = {
  Project: "CostControl",
  Environment: environment,
  ManagedBy: "CDK",
  Repository: "https://github.com/jameseraynor/Stephen",
};

// 1. Network Stack - VPC, Subnets, Security Groups
const networkStack = new NetworkStack(app, `${stackPrefix}-network`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  stackName: `${stackPrefix}-network`,
  description: "Network infrastructure (VPC, subnets, security groups)",
  tags,
});

// 2. Database Stack - Aurora Serverless v2
const databaseStack = new DatabaseStack(app, `${stackPrefix}-database`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  stackName: `${stackPrefix}-database`,
  description: "Database infrastructure (Aurora Serverless v2)",
  vpc: networkStack.vpc,
  lambdaSecurityGroup: networkStack.lambdaSecurityGroup,
  config,
  tags,
});

// 3. Auth Stack - Cognito User Pool
const authStack = new AuthStack(app, `${stackPrefix}-auth`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  stackName: `${stackPrefix}-auth`,
  description: "Authentication infrastructure (Cognito)",
  config,
  tags,
});

// 4. API Stack - API Gateway + Lambda Functions
const apiStack = new ApiStack(app, `${stackPrefix}-api`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  stackName: `${stackPrefix}-api`,
  description: "API infrastructure (API Gateway + Lambda)",
  vpc: networkStack.vpc,
  lambdaSecurityGroup: networkStack.lambdaSecurityGroup,
  databaseCluster: databaseStack.cluster,
  databaseSecret: databaseStack.secret,
  userPool: authStack.userPool,
  config,
  tags,
});

// 5. Frontend Stack - S3 + CloudFront
const frontendStack = new FrontendStack(app, `${stackPrefix}-frontend`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  stackName: `${stackPrefix}-frontend`,
  description: "Frontend infrastructure (S3 + CloudFront)",
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  api: apiStack.api,
  config,
  tags,
});

// Output deployment order
app.node.addMetadata("deployment-order", [
  "1. NetworkStack",
  "2. DatabaseStack (depends on Network)",
  "3. AuthStack (independent)",
  "4. ApiStack (depends on Network, Database, Auth)",
  "5. FrontendStack (depends on Auth, Api)",
]);
