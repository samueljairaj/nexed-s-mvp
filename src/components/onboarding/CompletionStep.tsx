
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ComplianceChecklist } from "./ComplianceChecklist";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface CompletionStepProps {
  onFinish: () => void;
  isSubmitting: boolean;
  userData?: {
    name?: string;
    visaType?: string;
    university?: string;
    fieldOfStudy?: string;
    employer?: string;
  };
}

export function CompletionStep({ onFinish, isSubmitting = false, userData = {} }: CompletionStepProps) {
  const [showChecklist, setShowChecklist] = useState(true);
  const navigate = useNavigate();
  const { isDSO } = useAuth();
  const [hasStartedOnboarding, setHasStartedOnboarding] = useState(false);

  // Handle go to dashboard button click
  const handleGoToDashboard = () => {
    console.log("Go to dashboard button clicked");
    
    // If onboarding has already started, don't do anything
    if (hasStartedOnboarding) {
      console.log("Onboarding already in progress, ignoring duplicate click");
      return;
    }
    
    // Set flag to prevent duplicate processing
    setHasStartedOnboarding(true);
    console.log("Setting hasStartedOnboarding to true");
    
    // Clear any existing flag first to ensure a clean state
    localStorage.removeItem('onboarding_completion_in_progress');
    
    // Set the localStorage flag to prevent redirection loops
    localStorage.setItem('onboarding_completion_in_progress', 'true');
    
    // Call the parent's onFinish handler which completes onboarding
    // This will trigger the navigation to the dashboard
    console.log("Calling onFinish handler");
    onFinish();
  };

  // Track checklist display and completion
  useEffect(() => {
    // Force the checklist to be visible for non-DSO users when component mounts
    if (!isDSO) {
      setShowChecklist(true);
    }
    
    // Check for existing onboarding flag when mounting component
    const inProgress = localStorage.getItem('onboarding_completion_in_progress');
    if (inProgress) {
      setHasStartedOnboarding(true);
    }
    
    // Cleanup function to clear flag if component is unmounted before completion
    return () => {
      // Only clear the flag if we set it ourselves and onboarding hasn't completed
      if (hasStartedOnboarding && localStorage.getItem('onboarding_completion_in_progress')) {
        localStorage.removeItem('onboarding_completion_in_progress');
      }
    };
  }, [isDSO, hasStartedOnboarding]);

  return (
    <>
      <div className="text-center py-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Profile Setup Complete!</h3>
        <p className="text-gray-600 mb-6">
          We've personalized your experience based on your {isDSO ? 'role' : 'visa type'} and details. 
          {!isDSO && ' Your personalized compliance checklist has been created and you\'re now ready to start managing your documents.'}
        </p>
        <div className="bg-nexed-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-nexed-700 mb-2">Your Next Steps:</h4>
          <ol className="text-left text-nexed-600 list-decimal list-inside space-y-2">
            {isDSO ? (
              <>
                <li>Manage student visa information</li>
                <li>Review compliance tasks for students</li>
                <li>Set up notifications for important deadlines</li>
                <li>Explore the dashboard to support your students</li>
              </>
            ) : (
              <>
                <li>Upload your required visa documents</li>
                <li>Complete any urgent compliance tasks</li>
                <li>Set up notifications for important deadlines</li>
                <li>Explore the dashboard to understand your visa status</li>
              </>
            )}
          </ol>
        </div>
        <Button 
          onClick={handleGoToDashboard} 
          className="nexed-gradient-button" 
          disabled={isSubmitting || hasStartedOnboarding}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Redirecting...
            </span>
          ) : "Go to Dashboard"}
        </Button>
      </div>

      {/* Compliance Checklist Dialog - Only show for students */}
      {!isDSO && (
        <ComplianceChecklist 
          open={showChecklist} 
          onOpenChange={(isOpen) => {
            // Only allow closing if we're not in the middle of onboarding
            if (!isOpen && !hasStartedOnboarding) {
              setShowChecklist(isOpen);
            }
          }}
          userData={userData}
          onContinue={handleGoToDashboard}
        />
      )}
    </>
  );
}
