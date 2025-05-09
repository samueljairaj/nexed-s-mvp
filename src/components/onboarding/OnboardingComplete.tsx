
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

interface OnboardingCompleteProps {
  handleFinish: () => Promise<any>;
  isSubmitting: boolean;
  role: "student" | "dso" | "admin";
}

export const OnboardingComplete = ({ 
  handleFinish, 
  isSubmitting,
  role = "student"
}: OnboardingCompleteProps) => {
  return (
    <div className="text-center max-w-lg mx-auto space-y-6">
      <div className="flex justify-center">
        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold">
        {role === "dso" 
          ? "Your DSO Profile is Complete!" 
          : "Your Student Profile is Complete!"}
      </h2>
      
      <p className="text-muted-foreground">
        {role === "dso" 
          ? "You've successfully set up your DSO account. You can now access the DSO dashboard to manage international students and compliance tasks." 
          : "You've successfully completed your onboarding. Your personalized compliance checklist is being prepared."}
      </p>
      
      <div className="py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-nexed-50 p-4 rounded-lg text-sm text-nexed-700">
            {role === "dso" ? (
              <>
                <p className="font-semibold">What's next?</p>
                <ul className="list-disc text-left ml-5 mt-2 space-y-1">
                  <li>Access your DSO dashboard</li>
                  <li>View student compliance status</li>
                  <li>Manage document verification</li>
                  <li>Set up compliance templates</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-semibold">What's next?</p>
                <ul className="list-disc text-left ml-5 mt-2 space-y-1">
                  <li>View your personalized compliance timeline</li>
                  <li>Upload required documents</li>
                  <li>Set up reminders for important deadlines</li>
                  <li>Connect with your DSO</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleFinish}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
            Processing...
          </>
        ) : (
          <>
            {role === "dso" ? "Go to DSO Dashboard" : "Go to Dashboard"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
