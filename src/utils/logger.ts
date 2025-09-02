/**
 * Utilidad para manejo de logs en desarrollo vs producción
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log para información general - solo en desarrollo
   */
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log para advertencias - siempre se muestra
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Log para errores - siempre se muestra
   */
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },

  /**
   * Log para debugging - solo en desarrollo
   */
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Log para procesos exitosos - solo en desarrollo
   */
  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[SUCCESS] ✓ ${message}`, ...args);
    }
  }
};