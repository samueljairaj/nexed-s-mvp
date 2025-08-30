# AI Development Rules for neXed MVP

This file contains development guidelines and patterns that should be followed by ALL AI assistants working on this project.

## Project Context
- **Project**: neXed - Visa Compliance Management Platform for International Students
- **Tech Stack**: React, TypeScript, Vite, Supabase, Tailwind CSS, shadcn/ui
- **Environment**: Development uses `.env.development`, production uses environment variables
- **Branch Strategy**: `feature/*`, `bugfix/*`, `hotfix/*` from `develop` branch

---

# Sentry Error Monitoring Rules (Code Rabbit Compliant)

## Import Pattern
Always import Sentry using:
```javascript
import * as Sentry from "@sentry/react";
```

## ✅ Secure Configuration (Code Rabbit Approved)
Use environment variables with proper security controls:
```javascript
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
    // Use lower sampling in production for performance
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? (import.meta.env.PROD ? "0.1" : "1.0")),
    profilesSampleRate: Number(import.meta.env.VITE_SENTRY_PROFILES_SAMPLE_RATE ?? "0"),
    release: import.meta.env.VITE_RELEASE,
  });
} else if (import.meta.env.DEV) {
  console.warn("Sentry DSN not set; Sentry.init skipped.");
}
```

## ❌ Deprecated Configuration (Code Rabbit Flagged)
**DO NOT USE** - Security and performance issues:
```javascript
// ❌ BAD - No DSN validation, insecure defaults
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // No validation
  sendDefaultPii: true,                  // Security risk
  tracesSampleRate: 1.0,                // Performance issue in prod
});
```

## ✅ Error Tracking (Recommended Patterns)
Use `Sentry.captureException()` in try-catch blocks for:
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
    extra: {
      userId: userId, 
      visaStatus: user.visaStatus
    }
  });
  throw error; // Re-throw for UI handling
}
```

## ✅ Context and Breadcrumbs (Recommended)
```javascript
// Add context breadcrumbs
Sentry.addBreadcrumb({
  category: "document",
  level: "info",
  message: "Document uploaded",
  data: { documentType: "visa", userId: user.id, fileSize: file.size },
});

// Capture messages for important events
Sentry.captureMessage("Visa status update failed", "error");

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  visaStatus: user.visaStatus,
  schoolName: user.schoolName,
  visaType: user.visaType
});
```

## ❌ Incorrect Usage (Code Rabbit Flagged)
**DO NOT USE** internal Sentry APIs:
```javascript
// ❌ BAD - Internal logger is not a public API
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

## Environment Variables Required
```bash
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_ENVIRONMENT=development|staging|production  
VITE_SENTRY_SEND_PII=false
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_PROFILES_SAMPLE_RATE=0
VITE_RELEASE=git_sha_or_version
```

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
