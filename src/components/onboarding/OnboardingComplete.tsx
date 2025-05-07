
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingCompleteProps {
  onFinish: () => void;
  isSubmitting?: boolean;
}

export function OnboardingComplete({ onFinish, isSubmitting = false }: OnboardingCompleteProps) {
  return (
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
        onClick={onFinish} 
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
  );
}
