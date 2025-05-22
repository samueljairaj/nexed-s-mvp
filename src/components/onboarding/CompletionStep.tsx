
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface CompletionStepProps {
  onFinish: () => Promise<boolean>;
  isSubmitting: boolean;
  userData?: {
    name?: string;
    visaType?: string;
    university?: string;
    fieldOfStudy?: string;
    employer?: string;
  };
}

export function CompletionStep({ onFinish, isSubmitting, userData }: CompletionStepProps) {
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
          
          {userData && (
            <div className="mt-4 text-left w-full">
              <h4 className="font-medium text-nexed-800 mb-2">Profile Summary:</h4>
              <ul className="space-y-1">
                {userData.name && (
                  <li className="text-sm text-green-700">
                    <span className="font-medium">Name:</span> {userData.name}
                  </li>
                )}
                {userData.visaType && (
                  <li className="text-sm text-green-700">
                    <span className="font-medium">Visa Type:</span> {userData.visaType}
                  </li>
                )}
                {userData.university && (
                  <li className="text-sm text-green-700">
                    <span className="font-medium">University:</span> {userData.university}
                  </li>
                )}
                {userData.fieldOfStudy && (
                  <li className="text-sm text-green-700">
                    <span className="font-medium">Field of Study:</span> {userData.fieldOfStudy}
                  </li>
                )}
                {userData.employer && (
                  <li className="text-sm text-green-700">
                    <span className="font-medium">Employer:</span> {userData.employer}
                  </li>
                )}
              </ul>
            </div>
          )}
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
