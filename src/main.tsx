import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import './index.css'

// Initialize Sentry as early as possible
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.VITE_ENVIRONMENT ?? "development",
    // Default OFF; opt-in via VITE_SENTRY_SEND_PII=true
    sendDefaultPii: (import.meta.env.VITE_SENTRY_SEND_PII === "true"),
    integrations: [
      Sentry.browserTracingIntegration(),
      // Consider reactRouterV6BrowserTracingIntegration in the Router layer
    ],
    // Use lower default in prod; override via env
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? (import.meta.env.PROD ? "0.1" : "1.0")),
    profilesSampleRate: Number(import.meta.env.VITE_SENTRY_PROFILES_SAMPLE_RATE ?? "0"),
    release: import.meta.env.VITE_RELEASE, // e.g., git SHA
  });
} else if (import.meta.env.DEV) {
  // Avoid throwing in local/dev when DSN is absent
  console.warn("Sentry DSN not set; Sentry.init skipped.");
}

createRoot(document.getElementById("root")!).render(<App />);
