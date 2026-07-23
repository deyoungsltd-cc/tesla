// Sentry Error Monitoring Setup
// Install: npm install @sentry/nextjs
// Then init with: npx sentry-wizard@latest

// For now, this is a lightweight error logger that can be upgraded to Sentry

export function logError(error: Error, context?: Record<string, any>) {
  const entry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
  };

  // Log to console (in production, send to Sentry/Datadog)
  console.error('[ERROR]', JSON.stringify(entry));

  // Future: Replace with Sentry.captureException(error)
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.captureException(error, { extra: context });
}

export function logInfo(message: string, context?: Record<string, any>) {
  console.info('[INFO]', message, context ? JSON.stringify(context) : '');
}

export function logWarning(message: string, context?: Record<string, any>) {
  console.warn('[WARN]', message, context ? JSON.stringify(context) : '');
}

// Performance tracking helper
export function trackPerformance(metric: string, duration: number, tags?: Record<string, string>) {
  console.log(`[PERF] ${metric}: ${duration}ms`, tags ? JSON.stringify(tags) : '');
}
