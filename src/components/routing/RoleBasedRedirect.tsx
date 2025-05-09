
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileProperty, debugAuthState } from '@/utils/propertyMapping';
import { toast } from 'sonner';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading } = useAuth();
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
    console.log("RoleBasedRedirect: Authentication state:", { isAuthenticated: !!currentUser, isLoading });
    
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

      // If onboarding is not complete, redirect to onboarding
      if (!onboardingComplete) {
        if (currentPath !== '/onboarding') {
          console.log("RoleBasedRedirect: User needs to complete onboarding, redirecting");
          navigate('/onboarding', { replace: true });
          setRedirectProcessed(true);
          setLastAttemptedPath('/onboarding');
          return;
        }
      }
      
      // Remove DSO-specific path checks
      // Just redirect any DSO paths to the regular dashboard
      if (currentPath.includes('/dso')) {
        navigate('/app/dashboard', { replace: true });
        setRedirectProcessed(true);
        setLastAttemptedPath('/app/dashboard');
        return;
      }
    } else {
      // User is not authenticated
      console.log("RoleBasedRedirect: User is not authenticated");
      
      // Protected routes need authentication
      if (currentPath.startsWith('/app/') || 
          currentPath === '/onboarding') {
        
        console.log("RoleBasedRedirect: Unauthenticated user trying to access protected route");
        
        // Show a toast message to inform the user
        toast.error("Please log in to access this page");
        
        // Redirect to the student landing page
        navigate('/student', { replace: true });
        setRedirectProcessed(true);
        setLastAttemptedPath('/student');
        return;
      }
    }
    
    // Reset processed flag if we don't redirect
    setRedirectProcessed(false);
    setLastAttemptedPath(currentPath);
  }, [currentUser, isLoading, navigate, location.pathname]);

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
