
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
  const redirectAttempts = useRef(0);
  const hasRunRef = useRef(false);

  // Reset state when location changes
  useEffect(() => {
    hasRunRef.current = false;
    redirectAttempts.current = 0;
  }, [location.pathname]);

  useEffect(() => {
    // Skip if loading or already redirected on this path
    if (isLoading || hasRunRef.current) return;
    
    // Set flag to prevent multiple redirects
    hasRunRef.current = true;
    
    // Safety mechanism to prevent redirect loops
    if (redirectAttempts.current > 2) {
      console.warn("Too many redirect attempts, possible loop detected");
      return;
    }
    
    redirectAttempts.current += 1;
    
    // Check if onboarding completion is in progress - don't redirect in this case
    const onboardingCompletionInProgress = localStorage.getItem('onboarding_completion_in_progress') === 'true';
    if (onboardingCompletionInProgress) {
      console.log("Onboarding completion in progress, skipping redirect check");
      return;
    }

    if (!isLoading && currentUser) {
      console.log("Checking user state for redirect:", {
        onboardingComplete: currentUser.onboardingComplete,
        isDSO,
        path: location.pathname
      });
      
      // For users who have completed onboarding
      if (currentUser.onboardingComplete) {
        // Direct DSO users to DSO dashboard if they're on onboarding or student dashboard
        if (isDSO && (location.pathname === '/app/dashboard' || location.pathname === '/onboarding')) {
          console.log("Redirecting DSO to DSO dashboard");
          navigate('/app/dso-dashboard', { replace: true });
          return;
        } 
        // Direct students to student dashboard if they're on onboarding or DSO dashboard
        else if (!isDSO && (location.pathname === '/app/dso-dashboard' || location.pathname === '/onboarding')) {
          console.log("Redirecting student to student dashboard");
          navigate('/app/dashboard', { replace: true });
          return;
        }
      }
      
      // For users who haven't completed onboarding
      if (!currentUser.onboardingComplete && !location.pathname.includes("/onboarding")) {
        console.log("User needs to complete onboarding, redirecting");
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // Prevent non-DSO users from accessing DSO routes
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
