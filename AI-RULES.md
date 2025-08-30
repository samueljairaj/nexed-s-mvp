# AI Rules for Sentry Integration

## Sentry Usage Guidelines

When implementing Sentry for error tracking and monitoring, follow these best practices:

### ✅ Correct Usage

Use Sentry's supported APIs for logging and error tracking:

```javascript
// For adding context and breadcrumbs
Sentry.addBreadcrumb({
  category: "document",
  level: "info",
  message: "Document uploaded",
  data: { documentType: "visa", userId: user.id, fileSize: file.size },
});

// For capturing messages and errors
Sentry.captureMessage("Visa status update failed", "error");

// For capturing exceptions
try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: "visa-tracking"
    },
    extra: {
      userId: user.id,
      context: "visa status update"
    }
  });
}
```

### ❌ Incorrect Usage

Do not use internal Sentry logger APIs that are not publicly exposed:

```javascript
// DON'T DO THIS - internal logger is not a public API
const { logger } = Sentry;

logger.info("Document uploaded", { 
  documentType: "visa", 
  userId: user.id,
  fileSize: file.size 
});

logger.error("Visa status update failed", {
  userId: user.id,
  error: error.message,
  feature: "visa-tracking"
});
```

### Environment Configuration

Ensure proper environment-based configuration:

```javascript
// Secure initialization with environment checks
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.VITE_ENVIRONMENT ?? "development",
    // Default OFF; opt-in via VITE_SENTRY_SEND_PII=true
    sendDefaultPii: (import.meta.env.VITE_SENTRY_SEND_PII === "true"),
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    // Use lower default in prod; override via env
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? (import.meta.env.PROD ? "0.1" : "1.0")),
    profilesSampleRate: Number(import.meta.env.VITE_SENTRY_PROFILES_SAMPLE_RATE ?? "0"),
    release: import.meta.env.VITE_RELEASE,
  });
} else if (import.meta.env.DEV) {
  console.warn("Sentry DSN not set; Sentry.init skipped.");
}
```

### Key Security Considerations

1. **PII Protection**: Keep `sendDefaultPii` disabled by default
2. **Sample Rates**: Use lower trace sampling in production (0.1) vs development (1.0)
3. **DSN Validation**: Always check for DSN presence before initialization
4. **Environment Variables**: Use environment-based configuration for all sensitive settings

### Environment Variables Required

```bash
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_ENVIRONMENT=development|staging|production
VITE_SENTRY_SEND_PII=false
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_PROFILES_SAMPLE_RATE=0
VITE_RELEASE=git_sha_or_version
```
