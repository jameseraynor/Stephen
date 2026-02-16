/**
 * Database Client
 *
 * PostgreSQL connection pool for Lambda functions.
 * Uses connection pooling optimized for serverless.
 */

import { Pool, PoolClient, QueryResult } from "pg";
import { getSecret } from "./secrets";

let pool: Pool | null = null;

interface DbCredentials {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

/**
 * Get database connection pool
 * Reuses pool across Lambda invocations (container reuse)
 */
export async function getDbPool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  // Get credentials from Secrets Manager
  const secretArn = process.env.DATABASE_SECRET_ARN;
  if (!secretArn) {
    throw new Error("DATABASE_SECRET_ARN environment variable not set");
  }

  const credentials = await getSecret<DbCredentials>(secretArn);

  // Create connection pool
  pool = new Pool({
    host: credentials.host,
    port: credentials.port,
    database: credentials.database,
    user: credentials.username,
    password: credentials.password,

    // Lambda-optimized settings
    max: 2, // Low max connections for Lambda
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 2000, // 2 seconds

    // SSL for Aurora
    ssl: {
      rejectUnauthorized: true,
    },
  });

  // Handle pool errors
  pool.on("error", (err) => {
    console.error("Unexpected database pool error:", err);
    pool = null; // Reset pool on error
  });

  return pool;
}

/**
 * Execute a query
 */
export async function query<T = any>(
  sql: string,
  params: any[] = [],
): Promise<QueryResult<T>> {
  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    return await client.query<T>(sql, params);
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database pool (for testing)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
