
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading, isDSO, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectedRef = useRef(false);
  const hasRunRef = useRef(false);
  const redirectAttempts = useRef(0);

  useEffect(() => {
    // Reset the redirect flag on location change
    redirectedRef.current = false;
    // Reset the run flag when location changes
    hasRunRef.current = false;
    // Reset redirect attempts counter
    redirectAttempts.current = 0;
  }, [location.pathname]);

  useEffect(() => {
    // Skip redirection if we're still loading or have already redirected
    if (isLoading || redirectedRef.current || hasRunRef.current) return;
    
    // Set flag to prevent this effect from running multiple times in the same location
    hasRunRef.current = true;

    // Check if onboarding completion is in progress - VERY IMPORTANT for preventing redirect loops
    const onboardingInProgress = localStorage.getItem('onboarding_completion_in_progress');
    
    // Skip redirection if onboarding is in progress (handled by useOnboardingCompletion)
    if (onboardingInProgress === 'true') {
      console.log("RoleBasedRedirect - Skipping redirect because onboarding completion is in progress");
      return;
    }

    // Safety check - if we've already tried to redirect more than 3 times without changing location,
    // we might be in a redirect loop
    if (redirectAttempts.current > 2) {
      console.warn("RoleBasedRedirect - Too many redirect attempts, possible redirect loop detected");
      return;
    }

    if (!isLoading && currentUser) {
      redirectAttempts.current += 1;
      redirectedRef.current = true; // Set flag to prevent multiple redirects
      
      console.log("RoleBasedRedirect - Checking user state:", {
        onboardingComplete: currentUser.onboardingComplete,
        isDSO,
        path: location.pathname
      });
      
      // If user has completed onboarding, ensure they're directed to the correct dashboard
      if (currentUser.onboardingComplete) {
        // Redirect based on user role, but only if they're on the onboarding page or wrong dashboard
        if (isDSO && (location.pathname === '/app/dashboard' || location.pathname === '/onboarding')) {
          console.log("RoleBasedRedirect - Redirecting DSO to DSO dashboard");
          navigate('/app/dso-dashboard', { replace: true });
          return;
        } else if (!isDSO && (location.pathname === '/app/dso-dashboard' || location.pathname === '/onboarding')) {
          console.log("RoleBasedRedirect - Redirecting student to student dashboard");
          navigate('/app/dashboard', { replace: true });
          return;
        }
      }
      
      // Handle onboarding for DSOs
      if (isDSO && !currentUser.onboardingComplete && 
          !location.pathname.includes("/onboarding")) {
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // Handle onboarding for non-DSOs (students)
      if (!isDSO && !currentUser.onboardingComplete && 
          !location.pathname.includes("/onboarding")) {
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // Prevent access to DSO-specific routes for non-DSO users
      if (!isDSO && (
        location.pathname === '/app/dso-dashboard' || 
        location.pathname === '/app/dso-profile'
      )) {
        navigate('/app/dashboard', { replace: true });
        return;
      }
    }
  }, [currentUser, isLoading, isDSO, isAdmin, navigate, location.pathname]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
