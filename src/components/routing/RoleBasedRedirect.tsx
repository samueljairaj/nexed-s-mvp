
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileProperty, debugAuthState } from '@/utils/propertyMapping';
import { toast } from 'sonner';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading, isDSO } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectProcessed, setRedirectProcessed] = useState(false);
  const [lastAttemptedPath, setLastAttemptedPath] = useState<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip redirection logic if we're still loading auth state
    if (isLoading) {
      console.log("RoleBasedRedirect: Still loading auth state, skipping redirection");
      return;
    }

    // Prevent redundant redirections to the same path
    if (redirectProcessed && lastAttemptedPath === currentPath) {
      console.log(`RoleBasedRedirect: Already processed redirection for ${currentPath}, skipping`);
      return;
    }

    console.log("RoleBasedRedirect: Processing path:", currentPath);
    console.log("RoleBasedRedirect: Authentication state:", { isAuthenticated: !!currentUser, isDSO, isLoading });
    
    // Debug user state
    if (currentUser) {
      debugAuthState(currentUser);
    }
    
    // Allow access to landing pages without redirection
    if (currentPath === '/' || currentPath === '/student' || currentPath === '/university') {
      console.log("RoleBasedRedirect: On landing page, no redirection needed");
      return;
    }

    // If user is authenticated
    if (currentUser) {
      const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
      console.log("RoleBasedRedirect: Onboarding complete:", onboardingComplete);

      // Critical fix: Handle onboarding paths strictly based on role
      if (!onboardingComplete) {
        if (isDSO) {
          if (currentPath !== '/dso-onboarding') {
            console.log("RoleBasedRedirect: DSO needs to complete DSO onboarding, redirecting");
            navigate('/dso-onboarding', { replace: true });
            setRedirectProcessed(true);
            setLastAttemptedPath('/dso-onboarding');
            return;
          }
        } else if (currentPath !== '/onboarding') {
          console.log("RoleBasedRedirect: Student needs to complete student onboarding, redirecting");
          navigate('/onboarding', { replace: true });
          setRedirectProcessed(true);
          setLastAttemptedPath('/onboarding');
          return;
        }
      }
      
      // Redirect to appropriate dashboard based on role and protected dashboard paths
      if (isDSO && currentPath === '/app/dashboard') {
        console.log("RoleBasedRedirect: DSO on student dashboard, redirecting to DSO dashboard");
        navigate('/app/dso-dashboard', { replace: true });
        setRedirectProcessed(true);
        setLastAttemptedPath('/app/dso-dashboard');
        return;
      } else if (!isDSO && currentPath === '/app/dso-dashboard') {
        console.log("RoleBasedRedirect: Student on DSO dashboard, redirecting to student dashboard");
        navigate('/app/dashboard', { replace: true });
        setRedirectProcessed(true);
        setLastAttemptedPath('/app/dashboard');
        return;
      }
      
      // Prevent access to DSO-specific routes for non-DSO users
      if (!isDSO && (
        currentPath === '/app/dso-dashboard' || 
        currentPath === '/app/dso-profile' ||
        currentPath === '/dso-onboarding'
      )) {
        console.log("RoleBasedRedirect: Non-DSO user trying to access DSO routes");
        navigate('/app/dashboard', { replace: true });
        setRedirectProcessed(true);
        setLastAttemptedPath('/app/dashboard');
        return;
      }

      // Prevent DSO users from accessing student onboarding
      if (isDSO && currentPath === '/onboarding') {
        console.log("RoleBasedRedirect: DSO user trying to access student onboarding");
        navigate('/dso-onboarding', { replace: true });
        setRedirectProcessed(true);
        setLastAttemptedPath('/dso-onboarding');
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
        
        // Show a toast message to inform the user
        toast.error("Please log in to access this page");
        
        // Redirect based on the path to the appropriate landing page
        if (currentPath.includes('dso') || currentPath === '/dso-onboarding') {
          navigate('/university', { replace: true });
          setRedirectProcessed(true);
          setLastAttemptedPath('/university');
        } else {
          navigate('/student', { replace: true });
          setRedirectProcessed(true);
          setLastAttemptedPath('/student');
        }
        return;
      }
    }
    
    // Reset processed flag if we don't redirect
    setRedirectProcessed(false);
    setLastAttemptedPath(currentPath);
  }, [currentUser, isLoading, isDSO, navigate, location.pathname]);

  // Safety timeout to prevent getting stuck in a redirect loop
  useEffect(() => {
    const timeout = setTimeout(() => {
      setRedirectProcessed(false); // Reset after timeout to allow new redirections
      setLastAttemptedPath(null);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [redirectProcessed]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
