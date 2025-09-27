import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Set release version
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Configure which errors to capture
  beforeSend(event, hint) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
      return null;
    }
    
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Filter out validation errors that are expected
      if (error instanceof Error) {
        if (error.message.includes('Validation error') ||
            error.message.includes('Unauthorized') ||
            error.message.includes('Forbidden')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Configure server context
  initialScope: {
    tags: {
      component: 'server',
    },
  },
  
  // Configure integrations
  integrations: [
    // Add any server-specific integrations here
  ],
});
