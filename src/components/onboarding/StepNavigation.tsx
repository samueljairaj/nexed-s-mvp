
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  formId?: string;
}

export function StepNavigation({
  onNext,
  onPrevious,
  currentStep,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  formId = "step-form" // Default form ID if none provided
}: StepNavigationProps) {
  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className="flex items-center gap-2 transition-all"
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <Button
        type={isLastStep ? "submit" : "submit"}
        onClick={isLastStep ? onNext : undefined}  // Only use onClick for last step
        disabled={isSubmitting}
        className="flex items-center gap-2 transition-all bg-nexed-500 hover:bg-nexed-600 text-white"
        form={formId}  // Always associate with the form
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
