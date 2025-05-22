
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading, isDSO } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    // Skip redirects if in the middle of onboarding completion
    const onboardingCompletionInProgress = localStorage.getItem('onboarding_completion_in_progress') === 'true';
    if (onboardingCompletionInProgress) {
      console.log("Onboarding completion in progress, skipping redirect check");
      return;
    }

    // Handle authenticated users
    if (currentUser) {
      console.log("Checking user state for redirect:", {
        path: location.pathname,
        onboardingComplete: currentUser.onboardingComplete,
        isDSO,
      });
      
      // Check if user needs to complete onboarding
      if (!currentUser.onboardingComplete && !location.pathname.includes("/onboarding")) {
        console.log("User needs to complete onboarding, redirecting");
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // For users who have completed onboarding
      if (currentUser.onboardingComplete) {
        // Redirect from onboarding or wrong dashboard
        if (location.pathname === '/onboarding') {
          const targetDashboard = isDSO ? '/app/dso-dashboard' : '/app/dashboard';
          console.log(`Redirecting from onboarding to ${targetDashboard}`);
          navigate(targetDashboard, { replace: true });
          return;
        }
        
        // Redirect DSOs to DSO dashboard if they're on student dashboard
        if (isDSO && location.pathname === '/app/dashboard') {
          console.log("Redirecting DSO to DSO dashboard");
          navigate('/app/dso-dashboard', { replace: true });
          return;
        }
        
        // Redirect students to student dashboard if they're on DSO dashboard
        if (!isDSO && location.pathname === '/app/dso-dashboard') {
          console.log("Redirecting student to student dashboard");
          navigate('/app/dashboard', { replace: true });
          return;
        }
      }
      
      // Prevent non-DSO users from accessing DSO routes
      if (!isDSO && location.pathname.includes('/app/dso-')) {
        console.log("Non-DSO user attempting to access DSO route");
        navigate('/app/dashboard', { replace: true });
        return;
      }
    }
  }, [currentUser, isLoading, isDSO, navigate, location.pathname]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
