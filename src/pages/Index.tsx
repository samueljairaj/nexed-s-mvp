
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDSO, isLoading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  
  useEffect(() => {
    console.log("Index: Auth state:", { isAuthenticated, isDSO, isLoading });
    
    // If auth is still loading, wait
    if (isLoading) {
      console.log("Index: Auth is still loading");
      return;
    }
    
    // Auth loading is done, update local loading state
    setLocalLoading(false);
    
    if (isAuthenticated) {
      // If authenticated, redirect based on role
      console.log("Index: User is authenticated, redirecting based on role. isDSO:", isDSO);
      if (isDSO) {
        navigate('/dso-onboarding', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } else {
      // If not authenticated, redirect to student landing by default
      console.log("Index: User is not authenticated, redirecting to student landing");
      navigate('/student', { replace: true });
    }
  }, [navigate, isAuthenticated, isDSO, isLoading]);

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (localLoading) {
        console.log("Index: Safety timeout triggered - redirecting to default landing page");
        navigate('/student', { replace: true });
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(safetyTimeout);
  }, [localLoading, navigate]);

  // Add another safety mechanism for a hard reload if we're stuck
  useEffect(() => {
    const hardTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Index: Hard timeout triggered - forcing reload");
        window.location.href = '/student';
      }
    }, 8000); // 8 second timeout before hard reload
    
    return () => clearTimeout(hardTimeout);
  }, [isLoading]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <div className="text-gray-500">Loading, please wait...</div>
    </div>
  );
};

export default Index;
