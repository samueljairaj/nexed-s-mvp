import { ReactNode } from 'react';
import { isFeatureEnabled, FeatureKey } from '@/config/features';

interface FeatureFlagProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureFlag = ({ feature, children, fallback = null }: FeatureFlagProps) => {
  if (isFeatureEnabled(feature)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};