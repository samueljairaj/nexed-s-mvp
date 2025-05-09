
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GraduationCap, Building2 } from "lucide-react";

export const UserTypeToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<string>("student");
  
  // Set the correct toggle state based on current route
  useEffect(() => {
    if (location.pathname === '/university') {
      setUserType("university");
    } else if (location.pathname === '/student' || location.pathname === '/') {
      setUserType("student");
    }
  }, [location.pathname]);

  const handleToggleChange = (value: string) => {
    if (!value || value === userType) return; // Don't navigate if no value or same page
    
    if (value === "university") {
      navigate('/university', { replace: true });
    } else {
      navigate('/student', { replace: true });
    }
  };

  return (
    <div className="flex justify-center">
      <ToggleGroup type="single" value={userType} onValueChange={handleToggleChange}>
        <ToggleGroupItem value="student" aria-label="Student" className="flex items-center gap-2 px-4">
          <GraduationCap className="h-4 w-4" />
          <span>Student</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="university" aria-label="University" className="flex items-center gap-2 px-4">
          <Building2 className="h-4 w-4" />
          <span>University</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default UserTypeToggle;
