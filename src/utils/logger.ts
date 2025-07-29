// Production-ready logging utility
interface LogContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

interface ErrorContext extends LogContext {
  stack?: string;
  component?: string;
  action?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private serviceName = 'farlandet-frontend';

  // Info level logging
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(`[${this.serviceName}] ${message}`, context);
    }
    this.sendToMonitoring('info', message, context);
  }

  // Warning level logging
  warn(message: string, context?: LogContext) {
    console.warn(`[${this.serviceName}] WARNING: ${message}`, context);
    this.sendToMonitoring('warn', message, context);
  }

  // Error level logging
  error(message: string, error?: Error, context?: ErrorContext) {
    const errorContext = {
      ...context,
      stack: error?.stack,
      message: error?.message,
      name: error?.name,
      timestamp: new Date().toISOString(),
    };

    console.error(`[${this.serviceName}] ERROR: ${message}`, errorContext);
    this.sendToMonitoring('error', message, errorContext);
  }

  // Debug level logging (development only)
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[${this.serviceName}] DEBUG: ${message}`, context);
    }
  }

  // Send logs to monitoring service (Sentry, etc.)
  private sendToMonitoring(level: string, message: string, context?: any) {
    // In production, this would send to your monitoring service
    if (!this.isDevelopment && window.Sentry) {
      switch (level) {
        case 'error':
          window.Sentry.captureException(new Error(message), {
            extra: context,
          });
          break;
        case 'warn':
          window.Sentry.captureMessage(message, 'warning');
          break;
        case 'info':
          window.Sentry.captureMessage(message, 'info');
          break;
      }
    }
  }

  // Performance monitoring
  timing(name: string, duration: number, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[${this.serviceName}] TIMING: ${name} took ${duration}ms`, context);
    }
    
    // Send performance data to monitoring
    if (!this.isDevelopment && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: name,
        value: duration,
        event_category: 'Performance',
      });
    }
  }
}

export const logger = new Logger();

// Performance measurement utility
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  context?: LogContext
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    logger.timing(name, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Performance measurement failed for ${name}`, error as Error, {
      ...context,
      duration,
    });
    throw error;
  }
}

// Async performance measurement
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.timing(name, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Async performance measurement failed for ${name}`, error as Error, {
      ...context,
      duration,
    });
    throw error;
  }
}

// Global error handler
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      component: 'global',
      action: 'unhandledrejection',
    });
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    logger.error('Global error', event.error, {
      component: 'global',
      action: 'error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

// Declare global types for monitoring services
declare global {
  interface Window {
    Sentry?: any;
    gtag?: any;
  }
}