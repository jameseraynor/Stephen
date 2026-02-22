/**
 * Router — Handler wrapper
 *
 * Eliminates repeated try/catch/finally/logger boilerplate from every handler.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse } from "./response";
import { logger } from "./logger";

type HandlerFn = (
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;

/**
 * Wraps a handler function with standard error handling and logging.
 */
export function createHandler(fn: HandlerFn): HandlerFn {
  return async (event) => {
    const requestId = event.requestContext.requestId;
    try {
      logger.appendKeys({ requestId });
      return await fn(event);
    } catch (error) {
      logger.error("Request failed", error as Error);
      return errorResponse(error, requestId);
    } finally {
      logger.resetKeys();
    }
  };
}
