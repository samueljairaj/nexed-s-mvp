
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingCompletionProps {
  onComplete: () => Promise<boolean>;
  isSubmitting: boolean;
}

export function OnboardingCompletion({ 
  onComplete, 
  isSubmitting 
}: OnboardingCompletionProps) {
  const { isDSO } = useAuth();

  return (
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
        onClick={onComplete}
        className="nexed-gradient-button" 
        disabled={isSubmitting}
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
