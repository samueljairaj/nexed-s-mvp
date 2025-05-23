
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComplianceChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: Record<string, any>;
  onContinue: () => void;
  isLoading?: boolean;
  sections: Array<{
    title: string;
    items: Array<{
      label: string;
      value: string | null;
      complete: boolean;
    }>;
  }>;
}

export function ComplianceChecklist({ 
  open, 
  onOpenChange, 
  userData, 
  onContinue, 
  isLoading = false,
  sections 
}: ComplianceChecklistProps) {
  const calculateCompletionRate = () => {
    let totalItems = 0;
    let completedItems = 0;
    
    sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        if (item.complete) {
          completedItems++;
        }
      });
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };
  
  const completionRate = calculateCompletionRate();
  const isComplete = completionRate >= 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboarding Compliance Checklist</DialogTitle>
          <DialogDescription>
            We've gathered the following information from your profile. Let's verify it before proceeding.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profile completion</span>
            <span className="text-sm font-medium">{completionRate}%</span>
          </div>
          
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 ease-in-out", 
                isComplete ? "bg-green-500" : "bg-amber-500"
              )}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          
          {!isComplete && (
            <div className="px-4 py-3 bg-amber-50 rounded-md border border-amber-100">
              <p className="text-amber-800 text-sm">
                We recommend completing your profile to at least 60% for more personalized compliance guidance.
              </p>
            </div>
          )}
          
          {sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-medium text-lg">{section.title}</h3>
              <div className="rounded-md border border-gray-200">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div>
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-sm text-gray-500">
                        {item.value || "Not provided"}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      {item.complete ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-4 w-4 text-green-600" />
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-2" />
        
        <DialogFooter>
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            onClick={onContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your dashboard...
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
