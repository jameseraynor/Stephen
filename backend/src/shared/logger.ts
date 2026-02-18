/**
 * Logger Utility
 *
 * Structured logging using AWS Lambda Powertools.
 * Outputs JSON to CloudWatch Logs with automatic Lambda context injection.
 *
 * Powertools Logger provides:
 * - Structured JSON output with standard fields (level, timestamp, service, etc.)
 * - Automatic Lambda context injection (function name, memory, cold start)
 * - Log sampling for debugging in production
 * - Persistent keys across all log items
 * - Child loggers for scoped context
 *
 * @see https://docs.powertools.aws.dev/lambda/typescript/latest/features/logger/
 */

import { Logger } from "@aws-lambda-powertools/logger";

/**
 * Application logger instance
 *
 * Configured via environment variables:
 * - POWERTOOLS_SERVICE_NAME: Service name (set in Lambda env)
 * - POWERTOOLS_LOG_LEVEL: Log level (DEBUG, INFO, WARN, ERROR)
 * - POWERTOOLS_LOGGER_SAMPLE_RATE: Sampling rate for debug logs (0.0-1.0)
 */
export const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME || "cost-control-api",
});
