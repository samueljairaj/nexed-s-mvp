
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function DSODashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    toast.info("DSO functionality has been disabled");
    navigate('/app/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg text-gray-600">Redirecting to student dashboard...</div>
    </div>
  );
}
