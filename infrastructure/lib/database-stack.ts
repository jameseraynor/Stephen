import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  config: any;
}

export class DatabaseStack extends cdk.Stack {
  public readonly cluster: rds.DatabaseCluster;
  public readonly secret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { vpc, lambdaSecurityGroup, config } = props;

    // Database credentials secret
    this.secret = new secretsmanager.Secret(this, "DatabaseSecret", {
      secretName: `${this.stackName}-db-credentials`,
      description: "Aurora database credentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "dbadmin" }),
        generateStringKey: "password",
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
      },
    });

    // Security group for database
    const dbSecurityGroup = new ec2.SecurityGroup(
      this,
      "DatabaseSecurityGroup",
      {
        vpc,
        securityGroupName: `${this.stackName}-db-sg`,
        description: "Security group for Aurora database",
        allowAllOutbound: false,
      },
    );

    // Allow Lambda to access database
    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow Lambda functions to access database",
    );

    // Aurora Serverless v2 Cluster
    this.cluster = new rds.DatabaseCluster(this, "DatabaseCluster", {
      clusterIdentifier: `${this.stackName}-cluster`,
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_6,
      }),

      // Serverless v2 configuration
      serverlessV2MinCapacity: config.auroraMinCapacity || 0.5,
      serverlessV2MaxCapacity: config.auroraMaxCapacity || 2,
      writer: rds.ClusterInstance.serverlessV2("writer", {
        publiclyAccessible: false,
      }),

      // Network configuration
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [dbSecurityGroup],

      // Database configuration
      defaultDatabaseName: "costcontrol",
      credentials: rds.Credentials.fromSecret(this.secret),

      // Backup configuration
      backup: {
        retention: cdk.Duration.days(config.backupRetentionDays || 7),
        preferredWindow: "03:00-04:00",
      },

      // Encryption
      storageEncrypted: true,

      // Deletion protection (enable for production)
      deletionProtection: config.environment === "prod",
      removalPolicy:
        config.environment === "prod"
          ? cdk.RemovalPolicy.SNAPSHOT
          : cdk.RemovalPolicy.DESTROY,

      // Monitoring
      cloudwatchLogsExports: ["postgresql"],
      cloudwatchLogsRetention: logs.RetentionDays.ONE_MONTH,

      // Performance Insights
      monitoringInterval: cdk.Duration.seconds(60),
    });

    // Note: Secret access is granted to Lambda functions individually in ApiStack

    // Outputs
    new cdk.CfnOutput(this, "ClusterEndpoint", {
      value: this.cluster.clusterEndpoint.hostname,
      description: "Database cluster endpoint",
      exportName: `${this.stackName}-cluster-endpoint`,
    });

    new cdk.CfnOutput(this, "ClusterPort", {
      value: this.cluster.clusterEndpoint.port.toString(),
      description: "Database cluster port",
      exportName: `${this.stackName}-cluster-port`,
    });

    new cdk.CfnOutput(this, "SecretArn", {
      value: this.secret.secretArn,
      description: "Database credentials secret ARN",
      exportName: `${this.stackName}-secret-arn`,
    });

    new cdk.CfnOutput(this, "DatabaseName", {
      value: "costcontrol",
      description: "Database name",
      exportName: `${this.stackName}-database-name`,
    });
  }
}
