/**
 * Database Client
 *
 * PostgreSQL client for Lambda functions.
 * Connects through RDS Proxy for managed connection pooling.
 *
 * RDS Proxy handles:
 * - Connection pooling across all Lambda invocations
 * - Connection reuse and multiplexing
 * - Automatic failover to Aurora replicas
 * - Credential rotation via Secrets Manager
 *
 * Lambda only needs a single connection per invocation (max: 1).
 * RDS Proxy manages the shared pool centrally.
 */

import { Client, QueryResult } from "pg";
import { getSecret } from "./secrets";

let client: Client | null = null;

interface DbCredentials {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

/**
 * Get database client
 * Connects to RDS Proxy endpoint (not directly to Aurora).
 * Reuses client across invocations within the same Lambda container.
 */
async function getClient(): Promise<Client> {
  if (client) {
    return client;
  }

  // Get credentials from Secrets Manager
  const secretArn = process.env.DATABASE_SECRET_ARN;
  if (!secretArn) {
    throw new Error("DATABASE_SECRET_ARN environment variable not set");
  }

  const credentials = await getSecret<DbCredentials>(secretArn);

  // RDS_PROXY_ENDPOINT is the RDS Proxy endpoint, not the Aurora cluster endpoint
  const host = process.env.RDS_PROXY_ENDPOINT || credentials.host;

  client = new Client({
    host,
    port: credentials.port,
    database: credentials.database,
    user: credentials.username,
    password: credentials.password,

    // Connection timeout
    connectionTimeoutMillis: 5000,

    // SSL for RDS Proxy
    ssl: {
      rejectUnauthorized: true,
    },
  });

  client.on("error", (err) => {
    console.error("Database client error:", err);
    client = null; // Reset on error so next invocation reconnects
  });

  await client.connect();
  return client;
}

/**
 * Execute a query
 */
export async function query<T = any>(
  sql: string,
  params: any[] = [],
): Promise<QueryResult<T>> {
  const db = await getClient();
  return db.query<T>(sql, params);
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: Client) => Promise<T>,
): Promise<T> {
  const db = await getClient();

  try {
    await db.query("BEGIN");
    const result = await callback(db);
    await db.query("COMMIT");
    return result;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

/**
 * Close database client (for testing)
 */
export async function closeClient(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
  }
}
