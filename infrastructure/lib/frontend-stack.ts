import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export interface FrontendStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  api: apigateway.RestApi;
  config: any;
}

export class FrontendStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { userPool, userPoolClient, api, config } = props;

    // S3 Bucket for frontend assets
    this.bucket = new s3.Bucket(this, "FrontendBucket", {
      bucketName: `${this.stackName}-frontend`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy:
        config.environment === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: config.environment !== "prod",
    });

    // Origin Access Identity for CloudFront
    const oai = new cloudfront.OriginAccessIdentity(this, "OAI", {
      comment: `OAI for ${this.stackName}`,
    });
    this.bucket.grantRead(oai);

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
      },

      defaultRootObject: "index.html",

      // SPA routing - return index.html for 404s
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],

      // Enable IPv6
      enableIpv6: true,

      // Price class (use all edge locations for production)
      priceClass:
        config.environment === "prod"
          ? cloudfront.PriceClass.PRICE_CLASS_ALL
          : cloudfront.PriceClass.PRICE_CLASS_100,

      // Comment
      comment: `${this.stackName} distribution`,
    });

    // Generate config.json for frontend
    const frontendConfig = {
      region: this.region,
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
      apiEndpoint: api.url,
      environment: config.environment,
    };

    // Deploy frontend (placeholder - actual deployment done via CI/CD)
    // This creates a config.json file in the bucket
    new s3deploy.BucketDeployment(this, "DeployConfig", {
      sources: [s3deploy.Source.jsonData("config.json", frontendConfig)],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ["/config.json"],
    });

    // Outputs
    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucket.bucketName,
      description: "Frontend S3 bucket name",
      exportName: `${this.stackName}-bucket-name`,
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: this.distribution.distributionId,
      description: "CloudFront distribution ID",
      exportName: `${this.stackName}-distribution-id`,
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: this.distribution.distributionDomainName,
      description: "CloudFront distribution domain name",
      exportName: `${this.stackName}-distribution-domain`,
    });

    new cdk.CfnOutput(this, "FrontendUrl", {
      value: `https://${this.distribution.distributionDomainName}`,
      description: "Frontend URL",
      exportName: `${this.stackName}-url`,
    });
  }
}
