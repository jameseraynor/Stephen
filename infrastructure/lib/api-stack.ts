import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface ApiStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  databaseCluster: rds.DatabaseCluster;
  databaseSecret: secretsmanager.Secret;
  userPool: cognito.UserPool;
  config: any;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const {
      vpc,
      lambdaSecurityGroup,
      databaseCluster,
      databaseSecret,
      userPool,
      config,
    } = props;

    // API Gateway
    this.api = new apigateway.RestApi(this, "Api", {
      restApiName: `${this.stackName}-api`,
      description: "Project Cost Control API",

      // Deploy options
      deployOptions: {
        stageName: config.environment || "dev",

        // Throttling
        throttlingRateLimit: config.apiRateLimit || 100,
        throttlingBurstLimit: config.apiBurstLimit || 200,

        // Logging
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: false, // Don't log request/response bodies

        // Metrics
        metricsEnabled: true,

        // Tracing
        tracingEnabled: true,
      },

      // CORS
      defaultCorsPreflightOptions: {
        allowOrigins: config.corsOrigins || apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.hours(1),
      },

      // CloudWatch role
      cloudWatchRole: true,
    });

    // Cognito Authorizer (commented until we have Lambda functions)
    // const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
    //   this,
    //   "Authorizer",
    //   {
    //     cognitoUserPools: [userPool],
    //     authorizerName: "CognitoAuthorizer",
    //     identitySource: "method.request.header.Authorization",
    //   },
    // );

    // Lambda Layer for shared code (commented until backend is built)
    // const sharedLayer = new lambda.LayerVersion(this, "SharedLayer", {
    //   code: lambda.Code.fromAsset("../backend/dist/layers/shared"),
    //   compatibleRuntimes: [lambda.Runtime.NODEJS_24_X],
    //   description: "Shared utilities and database client",
    // });

    // Common Lambda environment variables
    const commonEnvironment = {
      NODE_ENV: config.environment || "dev",
      LOG_LEVEL: config.logLevel || "INFO",
      DATABASE_SECRET_ARN: databaseSecret.secretArn,
      DATABASE_NAME: "costcontrol",
      DATABASE_HOST: databaseCluster.clusterEndpoint.hostname,
      DATABASE_PORT: databaseCluster.clusterEndpoint.port.toString(),
    };

    // Example Lambda function (projects list) - commented until backend is built
    // const listProjectsFunction = new lambda.Function(
    //   this,
    //   "ListProjectsFunction",
    //   {
    //     functionName: `${this.stackName}-projects-list`,
    //     runtime: lambda.Runtime.NODEJS_24_X,
    //     handler: "projects/list.handler",
    //     code: lambda.Code.fromAsset("../backend/dist"),
    //     timeout: cdk.Duration.seconds(30),
    //     memorySize: 512,
    //     environment: commonEnvironment,
    //     vpc,
    //     vpcSubnets: {
    //       subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //     },
    //     securityGroups: [lambdaSecurityGroup],
    //     layers: [sharedLayer],
    //     tracing: lambda.Tracing.ACTIVE,
    //     logRetention: logs.RetentionDays.ONE_WEEK,
    //   },
    // );

    // // Grant permissions
    // databaseSecret.grantRead(listProjectsFunction);

    // // API Resources
    // const projects = this.api.root.addResource("projects");

    // // GET /projects
    // projects.addMethod(
    //   "GET",
    //   new apigateway.LambdaIntegration(listProjectsFunction),
    //   {
    //     authorizer,
    //     authorizationType: apigateway.AuthorizationType.COGNITO,
    //   },
    // );

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", {
      value: this.api.url,
      description: "API Gateway URL",
      exportName: `${this.stackName}-api-url`,
    });

    new cdk.CfnOutput(this, "ApiId", {
      value: this.api.restApiId,
      description: "API Gateway ID",
      exportName: `${this.stackName}-api-id`,
    });
  }
}
