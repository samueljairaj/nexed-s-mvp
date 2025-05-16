
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

  useEffect(() => {
    // Reset the redirect flag on location change
    redirectedRef.current = false;
    
    // Return a cleanup function
    return () => {
      // This will run when the location changes or component unmounts
    };
  }, [location.pathname]);

  useEffect(() => {
    // Skip redirection if we're still loading or have already redirected
    if (isLoading || redirectedRef.current || hasRunRef.current) return;
    
    // Set flag to prevent this effect from running multiple times
    hasRunRef.current = true;

    if (!isLoading && currentUser) {
      redirectedRef.current = true; // Set flag to prevent multiple redirects
      
      // Redirect based on user role
      if (isDSO && location.pathname === '/app/dashboard') {
        navigate('/app/dso-dashboard', { replace: true });
        return;
      } else if (!isDSO && location.pathname === '/app/dso-dashboard') {
        navigate('/app/dashboard', { replace: true });
        return;
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
