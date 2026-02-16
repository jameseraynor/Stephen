/**
 * Logger Utility
 *
 * Structured logging for Lambda functions.
 * Logs are sent to CloudWatch Logs.
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || "INFO";
  }

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log message
   */
  private formatLog(level: LogLevel, message: string, data?: any): string {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...(data && { data }),
    };

    return JSON.stringify(log);
  }

  /**
   * Debug log
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog("DEBUG")) {
      console.log(this.formatLog("DEBUG", message, data));
    }
  }

  /**
   * Info log
   */
  info(message: string, data?: any): void {
    if (this.shouldLog("INFO")) {
      console.log(this.formatLog("INFO", message, data));
    }
  }

  /**
   * Warning log
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog("WARN")) {
      console.warn(this.formatLog("WARN", message, data));
    }
  }

  /**
   * Error log
   */
  error(message: string, error?: Error | any): void {
    if (this.shouldLog("ERROR")) {
      const errorData =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error;

      console.error(this.formatLog("ERROR", message, errorData));
    }
  }
}

// Export singleton instance
export const logger = new Logger();
