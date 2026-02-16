import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export interface AuthStackProps extends cdk.StackProps {
  config: any;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const { config } = props;

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${this.stackName}-users`,

      // Self-registration disabled (admin creates users)
      selfSignUpEnabled: false,

      // Sign-in options
      signInAliases: {
        email: true,
        username: false,
      },

      // Password policy
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(3),
      },

      // Account recovery
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

      // MFA configuration
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true, // TOTP only
      },

      // Standard attributes
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },

      // Custom attributes
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
      },

      // Advanced security
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,

      // Deletion protection
      removalPolicy:
        config.environment === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
    });

    // User Groups for RBAC
    new cognito.CfnUserPoolGroup(this, "AdminGroup", {
      userPoolId: this.userPool.userPoolId,
      groupName: "Admin",
      description: "Full system access",
      precedence: 1,
    });

    new cognito.CfnUserPoolGroup(this, "ProjectManagerGroup", {
      userPoolId: this.userPool.userPoolId,
      groupName: "ProjectManager",
      description: "Can manage assigned projects",
      precedence: 2,
    });

    new cognito.CfnUserPoolGroup(this, "ViewerGroup", {
      userPoolId: this.userPool.userPoolId,
      groupName: "Viewer",
      description: "Read-only access",
      precedence: 3,
    });

    // User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: `${this.stackName}-client`,

      // Auth flows
      authFlows: {
        userPassword: true,
        userSrp: true,
      },

      // OAuth configuration (for future SSO)
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: config.callbackUrls || ["http://localhost:5173/callback"],
        logoutUrls: config.logoutUrls || ["http://localhost:5173"],
      },

      // Token validity
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),

      // Prevent user existence errors
      preventUserExistenceErrors: true,
    });

    // Outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "Cognito User Pool ID",
      exportName: `${this.stackName}-user-pool-id`,
    });

    new cdk.CfnOutput(this, "UserPoolArn", {
      value: this.userPool.userPoolArn,
      description: "Cognito User Pool ARN",
      exportName: `${this.stackName}-user-pool-arn`,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      description: "Cognito User Pool Client ID",
      exportName: `${this.stackName}-user-pool-client-id`,
    });
  }
}
