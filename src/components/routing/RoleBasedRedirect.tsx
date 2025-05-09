
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
      
      // Prevent access to DSO-specific routes for non-DSO users
      if (!isDSO && (
        window.location.pathname === '/app/dso-dashboard' || 
        window.location.pathname === '/app/dso-profile'
      )) {
        navigate('/app/dashboard');
      }
    }
  }, [currentUser, isLoading, isDSO, isAdmin, navigate]);

  return <>{children}</>;
};

export default RoleBasedRedirect;
