/**
 * AWS Amplify Configuration
 *
 * Configures AWS Amplify for authentication and API access.
 * Environment variables are loaded from .env files.
 */

import { Amplify } from "aws-amplify";

// Environment variables (will be set during deployment)
const config = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || "",
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || "",
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || "",

      // Login configuration
      loginWith: {
        email: true,
        username: false,
      },

      // MFA configuration
      mfa: {
        status: "optional" as const,
        totpEnabled: true,
        smsEnabled: false,
      },

      // Password policy (matches Cognito configuration)
      passwordFormat: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },

  API: {
    REST: {
      "cost-control-api": {
        endpoint: import.meta.env.VITE_API_ENDPOINT || "",
        region: import.meta.env.VITE_AWS_REGION || "us-east-1",
      },
    },
  },
};

// Configure Amplify
export function configureAmplify() {
  Amplify.configure(config);
}

// Export config for testing
export { config };
