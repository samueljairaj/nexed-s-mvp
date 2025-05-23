
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ComplianceChecklistProps } from "@/types/compliance";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

export const ComplianceChecklist = ({
  open,
  onOpenChange,
  userData,
  onContinue,
  loading,
  sections
}: ComplianceChecklistProps) => {
  // Calculate overall completion percentage
  const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0);
  const completedItems = sections.reduce(
    (acc, section) => acc + section.items.filter(item => item.complete).length,
    0
  );
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Format dates for display
  const formatDate = (date: string | Date | null): string => {
    if (!date) return "Not provided";
    
    try {
      if (typeof date === 'string') {
        return format(new Date(date), "MMM dd, yyyy");
      } else {
        return format(date, "MMM dd, yyyy");
      }
    } catch (error) {
      return "Invalid date";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-2">
            Welcome to neXed Visa Compliance Platform
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Profile Completion</h3>
              <p className="text-muted-foreground text-sm">
                {completedItems} of {totalItems} items completed
              </p>
            </div>
            <span className="text-2xl font-bold">{completionPercentage}%</span>
          </div>
          
          <Progress value={completionPercentage} className="h-2 mb-6" />
          
          {/* Profile summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-md font-medium mb-2">Profile Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{userData.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Visa Type</p>
                <p className="font-medium">{userData.visaType || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">University</p>
                <p className="font-medium">{userData.university || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Field of Study</p>
                <p className="font-medium">{userData.fieldOfStudy || "Not provided"}</p>
              </div>
            </div>
          </div>
          
          {/* Checklist sections */}
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg p-4">
                <h3 className="text-md font-medium mb-2">{section.title}</h3>
                <Separator className="mb-3" />
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.complete ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-amber-600" />
                        )}
                        <span>{item.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.value instanceof Date || typeof item.value === 'string' 
                          ? formatDate(item.value)
                          : item.value === null || item.value === undefined
                            ? "Not provided" 
                            : String(item.value)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={async () => await onContinue()} 
            disabled={loading}
            className="bg-nexed-500 hover:bg-nexed-600"
          >
            {loading ? "Setting up your dashboard..." : "Continue to Dashboard"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceChecklist;
