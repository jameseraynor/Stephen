import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: `${this.stackName}-vpc`,
      maxAzs: 2, // Use 2 AZs for high availability
      natGateways: 1, // 1 NAT Gateway for cost optimization (MVP)

      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: "Isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],

      // Enable DNS
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Security Group for Lambda Functions
    this.lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      "LambdaSecurityGroup",
      {
        vpc: this.vpc,
        securityGroupName: `${this.stackName}-lambda-sg`,
        description: "Security group for Lambda functions",
        allowAllOutbound: true,
      },
    );

    // Security Group for Database
    this.databaseSecurityGroup = new ec2.SecurityGroup(
      this,
      "DatabaseSecurityGroup",
      {
        vpc: this.vpc,
        securityGroupName: `${this.stackName}-database-sg`,
        description: "Security group for Aurora database",
        allowAllOutbound: false,
      },
    );

    // Allow Lambda to access Database
    this.databaseSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow Lambda functions to access database",
    );

    // VPC Endpoints for AWS services (reduce NAT Gateway costs)
    this.vpc.addInterfaceEndpoint("SecretsManagerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      securityGroups: [this.lambdaSecurityGroup],
    });

    // Outputs
    new cdk.CfnOutput(this, "VpcId", {
      value: this.vpc.vpcId,
      description: "VPC ID",
      exportName: `${this.stackName}-vpc-id`,
    });

    new cdk.CfnOutput(this, "LambdaSecurityGroupId", {
      value: this.lambdaSecurityGroup.securityGroupId,
      description: "Lambda Security Group ID",
      exportName: `${this.stackName}-lambda-sg-id`,
    });

    new cdk.CfnOutput(this, "DatabaseSecurityGroupId", {
      value: this.databaseSecurityGroup.securityGroupId,
      description: "Database Security Group ID",
      exportName: `${this.stackName}-database-sg-id`,
    });
  }
}
