import * as Sentry from '@sentry/nextjs';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private enableSentry = process.env.ENABLE_ERROR_REPORTING === 'true';

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    let formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context) {
      formattedMessage += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
      if (error.stack) {
        formattedMessage += ` | Stack: ${error.stack}`;
      }
    }
    
    return formattedMessage;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }
    
    // In production, only log INFO and above
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(LogLevel.INFO);
    
    return currentLevelIndex >= minLevelIndex;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      metadata
    };

    // Console logging
    const formattedMessage = this.formatMessage(entry);
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        break;
    }

    // Sentry integration for errors
    if (this.enableSentry && (level === LogLevel.ERROR || level === LogLevel.FATAL)) {
      Sentry.withScope((scope: Sentry.Scope) => {
        // Set context
        if (context) {
          scope.setContext('logContext', context);
        }
        
        // Set tags
        scope.setTag('logLevel', level);
        scope.setTag('component', 'logger');
        
        // Set user context
        if (context?.userId) {
          scope.setUser({ id: context.userId });
        }
        
        // Set extra data
        if (metadata) {
          scope.setExtras(metadata);
        }
        
        // Capture the error
        if (error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(message, level === LogLevel.FATAL ? 'fatal' : 'error');
        }
      });
    }
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context, undefined, metadata);
  }

  info(message: string, context?: LogContext, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context, undefined, metadata);
  }

  warn(message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context, error, metadata);
  }

  error(message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error, metadata);
  }

  fatal(message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.FATAL, message, context, error, metadata);
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // API request logging
  logApiRequest(method: string, url: string, statusCode: number, responseTime: number, context?: LogContext) {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API ${method} ${url} - ${statusCode} (${responseTime}ms)`;
    
    this.log(level, message, context, undefined, {
      method,
      url,
      statusCode,
      responseTime
    });
  }

  // Database query logging
  logDatabaseQuery(query: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = `Database query executed in ${duration}ms`;
    
    this.log(level, message, context, undefined, {
      query: query.substring(0, 200), // Truncate long queries
      duration
    });
  }

  // Authentication logging
  logAuthEvent(event: string, userId?: string, context?: LogContext) {
    const message = `Auth event: ${event}`;
    const authContext = { ...context, userId };
    
    this.log(LogLevel.INFO, message, authContext, undefined, {
      authEvent: event,
      userId
    });
  }

  // Business logic logging
  logBusinessEvent(event: string, context?: LogContext, metadata?: Record<string, any>) {
    const message = `Business event: ${event}`;
    
    this.log(LogLevel.INFO, message, context, undefined, {
      businessEvent: event,
      ...metadata
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types and utilities
export { Logger };
export default logger;
