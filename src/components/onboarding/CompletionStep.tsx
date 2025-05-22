
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface CompletionStepProps {
  onFinish: () => Promise<boolean>;
  isSubmitting: boolean;
}

export function CompletionStep({ onFinish, isSubmitting }: CompletionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold">Onboarding Complete!</h2>
        <p className="text-muted-foreground mt-2">
          Thank you for completing the onboarding process. You're all set to use the platform.
        </p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">All Set!</h3>
          <p className="text-green-700">
            Your profile has been set up successfully. You can now access all the features of the platform.
          </p>
        </CardContent>
      </Card>

      <Button 
        onClick={onFinish}
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
            Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

export default CompletionStep;
