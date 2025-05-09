
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserTypeToggle } from "@/components/landing/UserTypeToggle";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Direct users to student landing page from the root
    navigate('/student', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="nexed-gradient">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center">
              <div className="h-6 w-6 rounded-sm nexed-gradient" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white">neXed</span>
          </div>
          
          <UserTypeToggle />
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : null}
    </div>
  );
};

export default Index;
