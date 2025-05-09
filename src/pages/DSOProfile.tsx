
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DSOProfile = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    toast.info("DSO functionality has been disabled");
    navigate('/app/profile', { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg text-gray-600">Redirecting to profile page...</div>
    </div>
  );
};

export default DSOProfile;
