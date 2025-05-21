
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OnboardingCompleteProps {
  handleFinish: () => Promise<boolean>;
  isSubmitting: boolean;
  role?: 'student' | 'dso';
}

export function OnboardingComplete({ 
  handleFinish, 
  isSubmitting = false, 
  role = 'student' 
}: OnboardingCompleteProps) {
  const [hasStartedOnboarding, setHasStartedOnboarding] = useState(false);
  
  const handleGoToDashboard = () => {
    console.log("Finish button clicked, calling handleFinish");
    // Prevent multiple clicks
    if (!hasStartedOnboarding) {
      setHasStartedOnboarding(true);
      
      // Prevent redirection loop by setting the flag immediately
      localStorage.setItem('onboarding_completion_in_progress', 'true');
      
      // Call the parent's onFinish handler
      handleFinish().catch(error => {
        console.error("Error in handleFinish:", error);
        localStorage.removeItem('onboarding_completion_in_progress');
        setHasStartedOnboarding(false);
      });
      
      // Note: navigation is handled in handleFinish
    }
  };

  return (
    <div className="text-center py-6">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Profile Setup Complete!</h3>
      <p className="text-gray-600 mb-6">
        We've personalized your experience based on your {role === 'dso' ? 'role' : 'visa type'} and details. 
        {role !== 'dso' && ' Your personalized compliance checklist has been created and you\'re now ready to start managing your documents.'}
      </p>
      <div className="bg-nexed-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-nexed-700 mb-2">Your Next Steps:</h4>
        <ol className="text-left text-nexed-600 list-decimal list-inside space-y-2">
          {role === 'dso' ? (
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
  );
}
