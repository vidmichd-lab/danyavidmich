// Sentry error tracking utility
// Only loads in production if SENTRY_DSN is configured

export async function initSentry() {
  if (typeof window === 'undefined') return;

  const dsn = import.meta.env.PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  try {
    // Load Sentry SDK dynamically
    const Sentry = await import('@sentry/browser');
    
    Sentry.init({
      dsn: dsn,
      environment: import.meta.env.PROD ? 'production' : 'development',
      tracesSampleRate: 0.1, // 10% of transactions
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of errors
      integrations: [
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      beforeSend(event, hint) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Ignore network errors for external resources
            if (error.message.includes('Failed to fetch') || 
                error.message.includes('NetworkError') ||
                error.message.includes('Load failed')) {
              return null;
            }
          }
        }
        return event;
      },
    });
  } catch {
    // Silently fail if Sentry can't be loaded
    // Error tracking should never break the site
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    const Sentry = await import('@sentry/browser');
    Sentry.captureException(error, {
      extra: context,
    });
  } catch {
    // Silently fail
  }
}

export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window === 'undefined') return;
  
  try {
    const Sentry = await import('@sentry/browser');
    Sentry.captureMessage(message, level);
  } catch {
    // Silently fail
  }
}

