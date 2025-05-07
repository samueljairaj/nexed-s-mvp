
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export function StepNavigation({
  currentStep,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  isSubmitting
}: StepNavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className={isLastStep ? "nexed-gradient-button" : ""}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            {isLastStep ? "Finishing..." : "Processing..."}
          </span>
        ) : (
          <>
            {isLastStep ? "Finish Setup" : "Next"}
            {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
          </>
        )}
      </Button>
    </div>
  );
}
