
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { currentUser, isLoading, isDSO } = useAuth();
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
      if (isDSO && !currentUser.onboarding_complete && !window.location.pathname.includes("/dso-onboarding")) {
        navigate('/dso-onboarding');
      }
      
      // Handle onboarding for students
      if (!isDSO && !currentUser.onboarding_complete && 
          !window.location.pathname.includes("/onboarding") && 
          window.location.pathname !== '/') {
        navigate('/onboarding');
      }
      
      // Redirect to appropriate onboarding based on role if on wrong onboarding page
      if (isDSO && window.location.pathname === '/onboarding') {
        navigate('/dso-onboarding');
      } else if (!isDSO && window.location.pathname === '/dso-onboarding') {
        navigate('/onboarding');
      }
      
      // Prevent access to DSO-specific routes for non-DSO users
      if (!isDSO && (
        window.location.pathname === '/app/dso-dashboard' || 
        window.location.pathname === '/app/dso-profile'
      )) {
        navigate('/app/dashboard');
      }
    }
  }, [currentUser, isLoading, isDSO, navigate]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
