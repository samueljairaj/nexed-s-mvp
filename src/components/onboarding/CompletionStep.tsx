
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface CompletionStepProps {
  onFinish: () => Promise<boolean>;
  isSubmitting: boolean;
  userData: {
    name?: string;
    visaType?: string;
    university?: string;
    fieldOfStudy?: string;
    employer?: string;
  };
}

export function CompletionStep({ 
  onFinish, 
  isSubmitting,
  userData
}: CompletionStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-center text-nexed-800">
          You're All Set!
        </h2>
        <p className="mt-2 text-center text-gray-600 max-w-md">
          Thank you for completing your onboarding. Your account is now ready to use with neXed.
        </p>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border mt-6">
        <h3 className="font-semibold text-lg mb-4">Your Information Summary</h3>
        <div className="space-y-3">
          {userData.name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{userData.name}</span>
            </div>
          )}
          {userData.visaType && (
            <div className="flex justify-between">
              <span className="text-gray-600">Visa Type:</span>
              <span className="font-medium">{userData.visaType}</span>
            </div>
          )}
          {userData.university && (
            <div className="flex justify-between">
              <span className="text-gray-600">University:</span>
              <span className="font-medium">{userData.university}</span>
            </div>
          )}
          {userData.fieldOfStudy && (
            <div className="flex justify-between">
              <span className="text-gray-600">Field of Study:</span>
              <span className="font-medium">{userData.fieldOfStudy}</span>
            </div>
          )}
          {userData.employer && (
            <div className="flex justify-between">
              <span className="text-gray-600">Employer:</span>
              <span className="font-medium">{userData.employer}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8 pt-4">
        <Button
          onClick={onFinish}
          disabled={isSubmitting}
          className="bg-nexed-500 hover:bg-nexed-600 px-8 py-2"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Processing...
            </>
          ) : (
            "Go to Dashboard"
          )}
        </Button>
      </div>
    </div>
  );
}
