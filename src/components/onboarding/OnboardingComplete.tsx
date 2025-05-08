
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ComplianceChecklist } from "./ComplianceChecklist";
import { useNavigate } from "react-router-dom";

interface OnboardingCompleteProps {
  onFinish: () => void;
  isSubmitting?: boolean;
  userData?: {
    name?: string;
    visaType?: string;
    university?: string;
    fieldOfStudy?: string;
    employer?: string;
    courseStartDate?: string;
    graduationDate?: string;
    employmentStatus?: string;
    optType?: string;
    previousUniversity?: string;
    hasTransferred?: boolean;
    employmentStartDate?: string;
    usEntryDate?: string;
  };
}

export function OnboardingComplete({ onFinish, isSubmitting = false, userData = {} }: OnboardingCompleteProps) {
  const [showChecklist, setShowChecklist] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show compliance checklist automatically after a short delay
    const timer = setTimeout(() => {
      setShowChecklist(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    // First call the onFinish function to update the user's onboarding status
    onFinish();
    
    // Then explicitly navigate to the dashboard using replace to prevent 
    // the user from navigating back to the onboarding flow with the back button
    navigate("/app/dashboard", { replace: true });
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Onboarding Complete!</h2>
          <p className="text-muted-foreground text-lg">
            Thank you for providing your information. Your account is now set up.
          </p>
        </div>
        
        <div className="max-w-md space-y-2">
          <p className="text-muted-foreground">
            We've prepared personalized recommendations and compliance timelines based on your inputs.
          </p>
          <p className="text-muted-foreground">
            You can now access all features of the platform. We'll notify you about any upcoming deadlines 
            or requirements based on your visa status.
          </p>
        </div>
        
        <Button 
          onClick={handleGoToDashboard} 
          className="mt-6 px-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
              Processing...
            </>
          ) : (
            "Go to Dashboard"
          )}
        </Button>
      </div>

      {/* Compliance Checklist Dialog */}
      <ComplianceChecklist 
        open={showChecklist} 
        onOpenChange={setShowChecklist} 
        userData={userData}
      />
    </>
  );
}
