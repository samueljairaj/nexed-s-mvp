
import { useState, useEffect } from "react";
import { Check, ChevronRight, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Step {
  title: string;
  description: string;
  element?: string; // Element ID to highlight
}

interface DashboardTourStepProps {
  onComplete: () => Promise<boolean>;
  isLoading: boolean;
}

export const DashboardTourStep = ({ onComplete, isLoading }: DashboardTourStepProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [skipped, setSkipped] = useState(false);
  
  // Define tour steps
  const steps: Step[] = [
    {
      title: "Welcome to Your DSO Dashboard",
      description: "This is where you'll manage international student compliance, track document submissions, and monitor deadlines."
    },
    {
      title: "Compliance Overview",
      description: "View and track overall compliance status across all students at your university."
    },
    {
      title: "Student Management",
      description: "From here, you can search, filter, and manage all students at your university."
    },
    {
      title: "Document Verification",
      description: "Review and approve student document submissions to ensure compliance."
    },
    {
      title: "Export Reports",
      description: "Generate and export reports for SEVIS and internal reporting requirements."
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleSkip = () => {
    setSkipped(true);
    handleComplete();
  };
  
  const handleComplete = async () => {
    await onComplete();
  };
  
  // When skipping, we should complete the onboarding
  useEffect(() => {
    if (skipped) {
      onComplete();
    }
  }, [skipped, onComplete]);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Dashboard Tour</CardTitle>
          <CardDescription>
            Let's explore your new DSO dashboard and its key features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Video Tutorial */}
          <div className="rounded-md overflow-hidden aspect-video bg-muted/30 flex flex-col items-center justify-center border">
            <div className="text-center p-8">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
              <h3 className="text-lg font-medium mb-2">DSO Dashboard Overview</h3>
              <p className="text-muted-foreground">
                Video tutorial coming soon!
              </p>
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Step Content */}
          <div className="bg-muted/20 p-6 rounded-lg border">
            <h3 className="text-lg font-medium">{steps[currentStep].title}</h3>
            <p className="mt-2 text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {currentStep === steps.length - 1 ? (
              isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Completing...
                </>
              ) : (
                <>
                  Complete <Check className="ml-1 h-4 w-4" />
                </>
              )
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Preview of Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Preview: DSO Dashboard</CardTitle>
          <CardDescription>
            Here's what you'll see when you complete the tour
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="font-medium mb-2">Overall Compliance</div>
                <div className="text-2xl font-bold text-primary">87%</div>
              </div>
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="font-medium mb-2">Students</div>
                <div className="text-2xl font-bold">125</div>
              </div>
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="font-medium mb-2">Pending Documents</div>
                <div className="text-2xl font-bold text-amber-500">18</div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Student Compliance</h3>
              <div className="h-52 bg-muted/20 rounded border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Student data will appear here
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTourStep;
