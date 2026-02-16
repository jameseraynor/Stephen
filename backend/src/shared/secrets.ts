/**
 * Secrets Manager Client
 *
 * Retrieves secrets from AWS Secrets Manager with caching.
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Cache secrets in memory (Lambda container reuse)
const secretsCache = new Map<string, any>();

/**
 * Get secret from Secrets Manager
 * Caches the secret for the lifetime of the Lambda container
 */
export async function getSecret<T = any>(secretArn: string): Promise<T> {
  // Check cache first
  if (secretsCache.has(secretArn)) {
    return secretsCache.get(secretArn);
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretArn,
    });

    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error(`Secret ${secretArn} has no SecretString`);
    }

    const secret = JSON.parse(response.SecretString) as T;

    // Cache the secret
    secretsCache.set(secretArn, secret);

    return secret;
  } catch (error) {
    console.error("Error retrieving secret:", error);
    throw new Error(`Failed to retrieve secret: ${secretArn}`);
  }
}

/**
 * Clear secrets cache (for testing)
 */
export function clearSecretsCache(): void {
  secretsCache.clear();
}
