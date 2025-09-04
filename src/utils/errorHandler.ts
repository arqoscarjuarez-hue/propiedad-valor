/**
 * Centralized error handling utilities
 */

import { logger } from './logging';
import { ValidationError, APIError } from '../types/global';

export interface ErrorReport {
  type: string;
  message: string;
  context?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
}

class ErrorHandler {
  private errorReports: ErrorReport[] = [];
  private maxReports = 50;

  /**
   * Handle and log any error
   */
  handleError(error: Error, context: string = 'UNKNOWN', additionalData?: any): ErrorReport {
    const report: ErrorReport = {
      type: error.name || 'Error',
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalData
    };

    // Log the error
    logger.error(`${report.type}: ${report.message}`, context, {
      stack: error.stack,
      ...additionalData
    });

    // Store the error report
    this.errorReports.push(report);
    
    // Keep only the last maxReports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }

    return report;
  }

  /**
   * Handle validation errors specifically
   */
  handleValidationError(field: string, message: string, value?: any): ValidationError {
    const error = new ValidationError(message, field);
    this.handleError(error, 'VALIDATION', { field, value });
    return error;
  }

  /**
   * Handle API errors specifically
   */
  handleAPIError(message: string, statusCode?: number, endpoint?: string): APIError {
    const error = new APIError(message, statusCode);
    this.handleError(error, 'API', { statusCode, endpoint });
    return error;
  }

  /**
   * Handle async operation errors with retry logic
   */
  async handleAsyncWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context: string = 'ASYNC'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Attempt ${attempt}/${maxRetries} for ${context}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.handleError(lastError, context, { attempts: maxRetries });
          throw lastError;
        }

        logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, context, {
          error: lastError.message
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw lastError!;
  }

  /**
   * Get error reports
   */
  getErrorReports(type?: string): ErrorReport[] {
    if (type) {
      return this.errorReports.filter(report => report.type === type);
    }
    return this.errorReports;
  }

  /**
   * Clear error reports
   */
  clearErrorReports(): void {
    this.errorReports = [];
  }

  /**
   * Export error reports as JSON
   */
  exportErrorReports(): string {
    return JSON.stringify(this.errorReports, null, 2);
  }

  /**
   * Check if error is recoverable
   */
  isRecoverableError(error: Error): boolean {
    const recoverableErrors = [
      'NetworkError',
      'TimeoutError',
      'AbortError',
      'TypeError' // Often caused by network issues
    ];

    return recoverableErrors.includes(error.name) || 
           error.message.includes('fetch') ||
           error.message.includes('network') ||
           error.message.includes('timeout');
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: Error): string {
    if (error instanceof ValidationError) {
      return `Error de validación: ${error.message}`;
    }

    if (error instanceof APIError) {
      if (error.statusCode === 404) {
        return 'El recurso solicitado no fue encontrado';
      }
      if (error.statusCode === 500) {
        return 'Error interno del servidor. Inténtalo más tarde';
      }
      if (error.statusCode === 403) {
        return 'No tienes permisos para realizar esta acción';
      }
      return 'Error de conexión. Verifica tu conexión a internet';
    }

    if (this.isRecoverableError(error)) {
      return 'Error temporal. Inténtalo de nuevo en unos momentos';
    }

    return 'Ha ocurrido un error inesperado. Si persiste, contacta al soporte';
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Convenience functions
export function handleError(error: Error, context?: string, additionalData?: any): ErrorReport {
  return errorHandler.handleError(error, context, additionalData);
}

export function handleValidationError(field: string, message: string, value?: any): ValidationError {
  return errorHandler.handleValidationError(field, message, value);
}

export function handleAPIError(message: string, statusCode?: number, endpoint?: string): APIError {
  return errorHandler.handleAPIError(message, statusCode, endpoint);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries?: number,
  delay?: number,
  context?: string
): Promise<T> {
  return errorHandler.handleAsyncWithRetry(operation, maxRetries, delay, context);
}

export function isRecoverableError(error: Error): boolean {
  return errorHandler.isRecoverableError(error);
}

export function getUserFriendlyMessage(error: Error): string {
  return errorHandler.getUserFriendlyMessage(error);
}
