import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface OnboardingNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  formId?: string;
}

export function OnboardingNavigation({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  isSubmitting,
  formId
}: OnboardingNavigationProps) {
  const handleNextClick = () => {
    if (isLastStep) {
      // If it's the last step, call onNext directly
      onNext();
    } 
    // Otherwise, submit is handled through form submission on the form with formId
  };

  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <Button
        type={isLastStep ? "button" : "submit"}
        onClick={isLastStep ? handleNextClick : undefined}
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-nexed-500 hover:bg-nexed-600 text-white"
        form={!isLastStep ? formId : undefined}
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Loading...
          </>
        ) : (
          <>
            {isLastStep ? "Complete" : "Continue"}
            {!isLastStep && <ArrowRight size={16} />}
          </>
        )}
      </Button>
    </div>
  );
}
