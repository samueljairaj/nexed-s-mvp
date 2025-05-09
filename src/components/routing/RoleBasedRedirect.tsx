
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
      return;
    }

    const currentPath = location.pathname;
    console.log("RoleBasedRedirect: Current path:", currentPath);
    console.log("RoleBasedRedirect: Authentication state:", { isAuthenticated: !!currentUser, isDSO, isLoading });
    
    // Allow access to landing pages without redirection
    if (currentPath === '/' || currentPath === '/student' || currentPath === '/university') {
      return;
    }

    // If user is authenticated
    if (currentUser) {
      const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
      console.log("RoleBasedRedirect: Onboarding complete:", onboardingComplete);
      
      // Handle authenticated users on landing pages
      if (currentPath === '/' || currentPath === '/student' || currentPath === '/university') {
        if (onboardingComplete) {
          navigate(isDSO ? '/app/dso-dashboard' : '/app/dashboard', { replace: true });
          return;
        } else {
          navigate(isDSO ? '/dso-onboarding' : '/onboarding', { replace: true });
          return;
        }
      }
      
      // Redirect based on user role and path
      if (isDSO && currentPath === '/app/dashboard') {
        navigate('/app/dso-dashboard', { replace: true });
        return;
      } else if (!isDSO && currentPath === '/app/dso-dashboard') {
        navigate('/app/dashboard', { replace: true });
        return;
      }
      
      // Handle onboarding for DSOs
      if (isDSO && !onboardingComplete && !currentPath.includes("/dso-onboarding")) {
        navigate('/dso-onboarding', { replace: true });
        return;
      }
      
      // Handle onboarding for students
      if (!isDSO && !onboardingComplete && !currentPath.includes("/onboarding")) {
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // Redirect to appropriate onboarding based on role if on wrong onboarding page
      if (isDSO && currentPath === '/onboarding') {
        navigate('/dso-onboarding', { replace: true });
        return;
      } else if (!isDSO && currentPath === '/dso-onboarding') {
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // Prevent access to DSO-specific routes for non-DSO users
      if (!isDSO && (
        currentPath === '/app/dso-dashboard' || 
        currentPath === '/app/dso-profile'
      )) {
        navigate('/app/dashboard', { replace: true });
        return;
      }
    } else {
      // User is not authenticated
      // Protected routes need authentication
      if (currentPath.startsWith('/app/') || 
          currentPath === '/onboarding' || 
          currentPath === '/dso-onboarding') {
        
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
