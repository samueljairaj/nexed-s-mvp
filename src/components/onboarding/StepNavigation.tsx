
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

interface StepNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  onBackToHome?: () => void;
}

export function StepNavigation({
  onNext,
  onPrevious,
  currentStep,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  onBackToHome
}: StepNavigationProps) {
  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      <div className="flex gap-2">
        {onBackToHome && (
          <Button
            type="button"
            variant="outline"
            onClick={onBackToHome}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Home size={16} />
            Back to Home
          </Button>
        )}
        
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
      </div>
      
      <Button
        type={isLastStep ? "button" : "submit"}
        onClick={isLastStep ? onNext : undefined}
        disabled={isSubmitting}
        className="flex items-center gap-2"
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
