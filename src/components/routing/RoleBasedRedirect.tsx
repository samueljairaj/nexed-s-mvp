
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileProperty } from '@/utils/propertyMapping';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading, isDSO } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip redirection logic if we're still loading auth state
    if (isLoading) {
      console.log("RoleBasedRedirect: Still loading auth state, skipping redirection");
      return;
    }

    const currentPath = location.pathname;
    console.log("RoleBasedRedirect: Current path:", currentPath);
    console.log("RoleBasedRedirect: Authentication state:", { isAuthenticated: !!currentUser, isDSO, isLoading });
    
    // Allow access to landing pages without redirection
    if (currentPath === '/' || currentPath === '/student' || currentPath === '/university') {
      console.log("RoleBasedRedirect: On landing page, no redirection needed");
      return;
    }

    // If user is authenticated
    if (currentUser) {
      const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
      console.log("RoleBasedRedirect: Onboarding complete:", onboardingComplete);
      
      // Special handling for authenticated users on landing pages to prevent unnecessary redirects
      if (currentPath === '/' || currentPath === '/student' || currentPath === '/university') {
        console.log("RoleBasedRedirect: Authenticated user on landing page, checking onboarding status");
        if (onboardingComplete) {
          navigate(isDSO ? '/app/dso-dashboard' : '/app/dashboard', { replace: true });
        } else {
          navigate(isDSO ? '/dso-onboarding' : '/onboarding', { replace: true });
        }
        return;
      }

      // Critical fix: Handle onboarding paths strictly based on role, regardless of path
      if (!onboardingComplete) {
        if (isDSO && currentPath !== '/dso-onboarding') {
          console.log("RoleBasedRedirect: DSO needs to complete DSO onboarding, redirecting");
          navigate('/dso-onboarding', { replace: true });
          return;
        } else if (!isDSO && currentPath !== '/onboarding') {
          console.log("RoleBasedRedirect: Student needs to complete student onboarding, redirecting");
          navigate('/onboarding', { replace: true });
          return;
        }
      }
      
      // Redirect to appropriate dashboard based on role and protected dashboard paths
      if (isDSO && currentPath === '/app/dashboard') {
        console.log("RoleBasedRedirect: DSO on student dashboard, redirecting to DSO dashboard");
        navigate('/app/dso-dashboard', { replace: true });
        return;
      } else if (!isDSO && currentPath === '/app/dso-dashboard') {
        console.log("RoleBasedRedirect: Student on DSO dashboard, redirecting to student dashboard");
        navigate('/app/dashboard', { replace: true });
        return;
      }
      
      // Prevent access to DSO-specific routes for non-DSO users
      if (!isDSO && (
        currentPath === '/app/dso-dashboard' || 
        currentPath === '/app/dso-profile'
      )) {
        console.log("RoleBasedRedirect: Non-DSO user trying to access DSO routes");
        navigate('/app/dashboard', { replace: true });
        return;
      }
    } else {
      // User is not authenticated
      console.log("RoleBasedRedirect: User is not authenticated");
      
      // Protected routes need authentication
      if (currentPath.startsWith('/app/') || 
          currentPath === '/onboarding' || 
          currentPath === '/dso-onboarding') {
        
        console.log("RoleBasedRedirect: Unauthenticated user trying to access protected route");
        // Redirect based on the path to the appropriate landing page
        if (currentPath.includes('dso') || currentPath === '/dso-onboarding') {
          navigate('/university', { replace: true });
        } else {
          navigate('/student', { replace: true });
        }
        return;
      }
    }
  }, [currentUser, isLoading, isDSO, navigate, location.pathname]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
