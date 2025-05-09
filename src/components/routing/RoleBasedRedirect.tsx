
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileProperty } from '@/utils/propertyMapping';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading, isDSO } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only attempt redirects if we're not currently loading authentication state
    if (!isLoading) {
      // If user is authenticated (has currentUser)
      if (currentUser) {
        // Get onboarding completion status
        const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
        
        // Redirect based on user role and path
        if (isDSO && window.location.pathname === '/app/dashboard') {
          navigate('/app/dso-dashboard');
          return;
        } else if (!isDSO && window.location.pathname === '/app/dso-dashboard') {
          navigate('/app/dashboard');
          return;
        }
        
        // Handle onboarding for DSOs
        if (isDSO && !onboardingComplete && !window.location.pathname.includes("/dso-onboarding") && window.location.pathname !== '/') {
          navigate('/dso-onboarding');
          return;
        }
        
        // Handle onboarding for students
        if (!isDSO && !onboardingComplete && 
            !window.location.pathname.includes("/onboarding") && 
            window.location.pathname !== '/') {
          navigate('/onboarding');
          return;
        }
        
        // Redirect to appropriate onboarding based on role if on wrong onboarding page
        if (isDSO && window.location.pathname === '/onboarding') {
          navigate('/dso-onboarding');
          return;
        } else if (!isDSO && window.location.pathname === '/dso-onboarding') {
          navigate('/onboarding');
          return;
        }
        
        // Prevent access to DSO-specific routes for non-DSO users
        if (!isDSO && (
          window.location.pathname === '/app/dso-dashboard' || 
          window.location.pathname === '/app/dso-profile'
        )) {
          navigate('/app/dashboard');
          return;
        }
      }
    }
  }, [currentUser, isLoading, isDSO, navigate]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
