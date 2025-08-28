// Feature flags for MVP launch
// Set to false to hide features, true to show them

export const FEATURES = {
  // Core MVP features (always enabled)
  DASHBOARD: true,
  DOCUMENTS: true,
  ONBOARDING: true,
  PROFILE: true,
  
  // Advanced features (hidden for MVP)
  COMPLIANCE_HUB: false,
  AI_ASSISTANT: false,
  ADVANCED_SETTINGS: false,
  
  // DSO features (already disabled)
  DSO_FEATURES: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export const isFeatureEnabled = (feature: FeatureKey): boolean => {
  return FEATURES[feature];
};
