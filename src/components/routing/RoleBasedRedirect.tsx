
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileProperty } from '@/utils/propertyMapping';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading, isDSO, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // Redirect based on user role
      if (isDSO && window.location.pathname === '/app/dashboard') {
        navigate('/app/dso-dashboard');
      } else if (!isDSO && window.location.pathname === '/app/dso-dashboard') {
        navigate('/app/dashboard');
      }
      
      // Handle onboarding for DSOs
      const onboardingComplete = getProfileProperty(currentUser, 'onboarding_complete');
      if (isDSO && !onboardingComplete && !window.location.pathname.includes("/dso-onboarding")) {
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
  }, [currentUser, isLoading, isDSO, navigate]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
