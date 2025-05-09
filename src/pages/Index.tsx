
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDSO, isLoading } = useAuth();
  
  useEffect(() => {
    if (isLoading) {
      return; // Wait for authentication to load
    }
    
    if (isAuthenticated) {
      // If authenticated, redirect based on role
      navigate(isDSO ? '/university' : '/student', { replace: true });
    } else {
      // If not authenticated, redirect to student landing by default
      navigate('/student', { replace: true });
    }
  }, [navigate, isAuthenticated, isDSO, isLoading]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
