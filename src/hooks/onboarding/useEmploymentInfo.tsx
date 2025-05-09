
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useEmploymentInfo() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employmentData, setEmploymentData] = useState({
    employmentStatus: "Not Employed",
    employerName: "",
    jobTitle: "",
    employmentStartDate: null,
    employmentEndDate: null,
    isFieldRelated: false,
    optCptStartDate: null,
    optCptEndDate: null,
    eadNumber: "",
    stemEVerify: "",
    stemI983Date: null
  });

  const handleEmploymentInfo = async (data: any) => {
    setEmploymentData(data);
    setIsSubmitting(true);
    
    try {
      // Only include properties that exist in the database schema
      const updateData: any = {};
      
      // Safely handle employmentStartDate with additional type checking
      if (data.employmentStartDate) {
        if (data.employmentStartDate instanceof Date) {
          updateData.employmentStartDate = data.employmentStartDate.toISOString();
        } else if (typeof data.employmentStartDate === 'string') {
          updateData.employmentStartDate = data.employmentStartDate;
        } else {
          console.log("employmentStartDate is neither a Date nor a string:", data.employmentStartDate);
        }
      }

      console.log("Updating profile with employment data:", updateData);
      
      await updateProfile(updateData);
      return true;
    } catch (error) {
      toast.error("Failed to save employment information");
      console.error("Employment info update error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fix: Change parameter type from string to boolean to match what EmploymentStep expects
  const handleEmploymentStatusChange = (status: boolean) => {
    setEmploymentData(prev => ({ ...prev, employmentStatus: status ? "Employed" : "Not Employed" }));
  };
  
  const isF1OrJ1 = (visaType: string) => {
    return visaType === "F1" || visaType === "J1";
  };
  
  const isEmployed = () => {
    return employmentData.employmentStatus !== "Not Employed";
  };
  
  const isOptOrCpt = () => {
    return employmentData.employmentStatus === "CPT" || 
           employmentData.employmentStatus === "OPT" || 
           employmentData.employmentStatus === "STEM OPT Extension";
  };
  
  const isStemOpt = () => {
    return employmentData.employmentStatus === "STEM OPT Extension";
  };

  return {
    employmentData,
    setEmploymentData,
    handleEmploymentInfo,
    handleEmploymentStatusChange,
    isF1OrJ1,
    isEmployed,
    isOptOrCpt,
    isStemOpt,
    isSubmitting
  };
}
