/**
 * Centralized logging utilities for better debugging and error tracking
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context || 'APP',
      data
    };
  }

  private writeLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = `[${entry.level.toUpperCase()}] ${entry.context}: `;
      
      switch (entry.level) {
        case 'error':
          console.error(prefix + entry.message, entry.data || '');
          break;
        case 'warn':
          console.warn(prefix + entry.message, entry.data || '');
          break;
        case 'info':
          console.info(prefix + entry.message, entry.data || '');
          break;
        case 'debug':
          console.debug(prefix + entry.message, entry.data || '');
          break;
      }
    }
  }

  info(message: string, context?: string, data?: any) {
    this.writeLog(this.createLogEntry('info', message, context, data));
  }

  warn(message: string, context?: string, data?: any) {
    this.writeLog(this.createLogEntry('warn', message, context, data));
  }

  error(message: string, context?: string, data?: any) {
    this.writeLog(this.createLogEntry('error', message, context, data));
  }

  debug(message: string, context?: string, data?: any) {
    this.writeLog(this.createLogEntry('debug', message, context, data));
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as string
  exportLogs(): string {
    return this.logs
      .map(log => `${log.timestamp} [${log.level.toUpperCase()}] ${log.context}: ${log.message}`)
      .join('\n');
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions for common contexts
export const logPropertyValuation = {
  info: (message: string, data?: any) => logger.info(message, 'PROPERTY_VALUATION', data),
  warn: (message: string, data?: any) => logger.warn(message, 'PROPERTY_VALUATION', data),
  error: (message: string, data?: any) => logger.error(message, 'PROPERTY_VALUATION', data),
  debug: (message: string, data?: any) => logger.debug(message, 'PROPERTY_VALUATION', data)
};

export const logGeolocation = {
  info: (message: string, data?: any) => logger.info(message, 'GEOLOCATION', data),
  warn: (message: string, data?: any) => logger.warn(message, 'GEOLOCATION', data),
  error: (message: string, data?: any) => logger.error(message, 'GEOLOCATION', data),
  debug: (message: string, data?: any) => logger.debug(message, 'GEOLOCATION', data)
};

export const logAPI = {
  info: (message: string, data?: any) => logger.info(message, 'API', data),
  warn: (message: string, data?: any) => logger.warn(message, 'API', data),
  error: (message: string, data?: any) => logger.error(message, 'API', data),
  debug: (message: string, data?: any) => logger.debug(message, 'API', data)
};

export const logAuth = {
  info: (message: string, data?: any) => logger.info(message, 'AUTH', data),
  warn: (message: string, data?: any) => logger.warn(message, 'AUTH', data),
  error: (message: string, data?: any) => logger.error(message, 'AUTH', data),
  debug: (message: string, data?: any) => logger.debug(message, 'AUTH', data)
};

// Error boundary helper
export function logError(error: Error, context: string = 'GENERAL', additionalData?: any) {
  logger.error(
    `${error.name}: ${error.message}`,
    context,
    {
      stack: error.stack,
      ...additionalData
    }
  );
}

// Performance logging helper
export function logPerformance(operation: string, startTime: number, context: string = 'PERFORMANCE') {
  const duration = Date.now() - startTime;
  logger.info(`${operation} completed in ${duration}ms`, context);
}

// Safe async operation logger
export async function logAsyncOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context: string = 'ASYNC'
): Promise<T> {
  const startTime = Date.now();
  
  try {
    logger.debug(`Starting ${operationName}`, context);
    const result = await operation();
    logPerformance(operationName, startTime, context);
    return result;
  } catch (error) {
    logError(error as Error, context, { operationName, duration: Date.now() - startTime });
    throw error;
  }
}
