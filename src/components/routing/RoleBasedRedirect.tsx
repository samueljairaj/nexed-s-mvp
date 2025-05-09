
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
    // Only attempt redirects if we're not currently loading authentication state
    if (!isLoading) {
      const currentPath = window.location.pathname;
      console.log("RoleBasedRedirect: Current path:", currentPath);
      console.log("RoleBasedRedirect: Authentication state:", { isAuthenticated: !!currentUser, isDSO, isLoading });
      
      // If user is authenticated (has currentUser)
      if (currentUser) {
        // Get onboarding completion status
        const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
        console.log("RoleBasedRedirect: Onboarding complete:", onboardingComplete);
        
        // Handle landing pages - authenticated users shouldn't be on them
        if (currentPath === '/' || currentPath === '/student' || currentPath === '/university') {
          if (onboardingComplete) {
            console.log("RoleBasedRedirect: Redirecting to dashboard");
            navigate(isDSO ? '/app/dso-dashboard' : '/app/dashboard');
            return;
          } else {
            console.log("RoleBasedRedirect: Redirecting to onboarding");
            navigate(isDSO ? '/dso-onboarding' : '/onboarding');
            return;
          }
        }
        
        // Redirect based on user role and path
        if (isDSO && currentPath === '/app/dashboard') {
          navigate('/app/dso-dashboard');
          return;
        } else if (!isDSO && currentPath === '/app/dso-dashboard') {
          navigate('/app/dashboard');
          return;
        }
        
        // Handle onboarding for DSOs
        if (isDSO && !onboardingComplete && !currentPath.includes("/dso-onboarding")) {
          navigate('/dso-onboarding');
          return;
        }
        
        // Handle onboarding for students
        if (!isDSO && !onboardingComplete && !currentPath.includes("/onboarding")) {
          navigate('/onboarding');
          return;
        }
        
        // Redirect to appropriate onboarding based on role if on wrong onboarding page
        if (isDSO && currentPath === '/onboarding') {
          navigate('/dso-onboarding');
          return;
        } else if (!isDSO && currentPath === '/dso-onboarding') {
          navigate('/onboarding');
          return;
        }
        
        // Prevent access to DSO-specific routes for non-DSO users
        if (!isDSO && (
          currentPath === '/app/dso-dashboard' || 
          currentPath === '/app/dso-profile'
        )) {
          navigate('/app/dashboard');
          return;
        }
      } else {
        // User is not authenticated
        // Allow access to landing pages
        if (currentPath === '/' || currentPath === '/student' || currentPath === '/university') {
          return; // Do nothing, let them access the landing page
        }
        
        // Protect authenticated routes
        if (currentPath.startsWith('/app/') || 
            currentPath === '/onboarding' || 
            currentPath === '/dso-onboarding') {
          // Redirect based on the path to the appropriate landing page
          if (currentPath.includes('dso') || currentPath === '/dso-onboarding') {
            navigate('/university');
          } else {
            navigate('/student');
          }
          return;
        }
      }
    }
  }, [currentUser, isLoading, isDSO, navigate, location.pathname]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
