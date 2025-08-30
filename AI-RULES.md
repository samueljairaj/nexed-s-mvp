<<<<<<< HEAD
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
=======
# AI Development Rules for neXed MVP

This file contains development guidelines and patterns that should be followed by ALL AI assistants working on this project.

## Project Context
- **Project**: neXed - Visa Compliance Management Platform for International Students
- **Tech Stack**: React, TypeScript, Vite, Supabase, Tailwind CSS, shadcn/ui
- **Environment**: Development uses `.env.development`, production uses environment variables
- **Branch Strategy**: `feature/*`, `bugfix/*`, `hotfix/*` from `develop` branch

---

# Sentry Error Monitoring Rules

## Import Pattern
Always import Sentry using:
```javascript
import * as Sentry from "@sentry/react";
```

## Configuration
Use environment variables for DSN:
```javascript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT || "development",
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  tracesSampleRate: 1.0,
  enableLogs: true,
});
```

## Error Tracking
Use `Sentry.captureException(error)` in try-catch blocks, especially for:
- Document upload/download failures
- Visa status update errors
- Authentication failures
- Supabase API errors
- User onboarding issues

```javascript
try {
  await uploadVisaDocument(file);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'document-upload',
      documentType: file.type
    },
    user: { id: userId, visaStatus: user.visaStatus }
  });
  throw error;
}
```

## Performance Tracking
Create spans for meaningful user actions:

### Document Operations
```javascript
function DocumentUpload() {
  const handleUpload = (file) => {
    Sentry.startSpan(
      {
        op: "document.upload",
        name: "Upload Visa Document",
      },
      (span) => {
        span.setAttribute("document.type", file.type);
        span.setAttribute("document.size", file.size);
        span.setAttribute("user.visaStatus", user.visaStatus);
        
        return uploadDocument(file);
      },
    );
  };
}
```

### API Calls
```javascript
async function fetchUserData(userId) {
  return Sentry.startSpan(
    {
      op: "db.query",
      name: "GET user visa status",
    },
    async (span) => {
      span.setAttribute("user.id", userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);
        
      if (error) {
        Sentry.captureException(error, {
          tags: { feature: 'user-data' }
        });
      }
      
      return data;
    },
  );
}
```

## User Context
Always set user context for better debugging:
```javascript
Sentry.setUser({
  id: user.id,
  email: user.email,
  visaStatus: user.visaStatus,
  schoolName: user.schoolName,
  visaType: user.visaType
});

Sentry.setTag("feature", "feature-name");
Sentry.setContext("visa", {
  type: user.visaType,
  expiryDate: user.visaExpiry,
  isCompliant: user.isCompliant
});
```

## Logging
Use structured logging with Sentry logger:
```javascript
>>>>>>> 8e13f94cc76537f67908e0200e9bffdb7208ca54
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

<<<<<<< HEAD
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
=======
---

# React Development Rules

## Component Structure
- Use functional components with hooks
- Implement proper error boundaries for critical features
- Use TypeScript interfaces for all props and data structures

## Error Boundaries
Wrap critical components with Sentry error boundaries:
```javascript
const DocumentVaultWithErrorBoundary = Sentry.withErrorBoundary(DocumentVault, {
  fallback: ({ error, resetError }) => (
    <ErrorFallback error={error} resetError={resetError} />
  ),
  beforeCapture: (scope) => {
    scope.setTag("component", "document-vault");
  }
});
```

---

# Supabase Integration Rules

## Error Handling
Always handle Supabase errors properly:
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('*');

if (error) {
  Sentry.captureException(error, {
    tags: { 
      feature: 'database-operation',
      table: 'table_name'
    }
  });
  throw new Error(`Database operation failed: ${error.message}`);
}
```

## Authentication Context
Track authentication state changes:
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    Sentry.setUser({
      id: session.user.id,
      email: session.user.email
    });
  } else if (event === 'SIGNED_OUT') {
    Sentry.setUser(null);
  }
});
```

---

# neXed-Specific Business Rules

## Feature Tags
Use these consistent tags for Sentry events:
- `"document-upload"` - Document vault operations
- `"document-download"` - Document retrieval
- `"visa-status"` - Visa status tracking and updates
- `"onboarding"` - User onboarding flow
- `"dashboard"` - Dashboard data loading
- `"auth"` - Authentication operations
- `"compliance"` - Compliance checking features

## User Context
Include visa-specific context in all Sentry events:
- `visaStatus`: Current visa status
- `visaType`: Type of visa (F-1, H-1B, etc.)
- `schoolName`: User's educational institution
- `isCompliant`: Current compliance status
- `visaExpiry`: Visa expiration date

## Critical User Flows to Monitor
1. **Document Upload Process**
   - File validation errors
   - Upload failures
   - Storage issues

2. **Visa Status Updates**
   - Status change failures
   - Compliance calculation errors
   - Notification failures

3. **User Onboarding**
   - Step completion tracking
   - Profile setup errors
   - Initial document upload

4. **Dashboard Loading**
   - Data fetching errors
   - Performance issues
   - Missing data scenarios

---

# Code Quality Rules

## TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types - use proper typing

## Error Messages
- Provide user-friendly error messages
- Log technical details to Sentry
- Include context for debugging

## Performance
- Monitor component render times
- Track API response times
- Optimize document upload/download flows

---

# Environment Variables

Required environment variables:
- `VITE_SENTRY_DSN` - Sentry project DSN
- `VITE_ENVIRONMENT` - Current environment (development/test/staging/production)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

---

**Note for AI Assistants**: Always reference these rules when implementing features, fixing bugs, or adding monitoring to the neXed platform. These patterns ensure consistent error tracking and monitoring across the entire application.
>>>>>>> 8e13f94cc76537f67908e0200e9bffdb7208ca54
