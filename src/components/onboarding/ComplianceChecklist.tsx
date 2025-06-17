
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ComplianceChecklistProps } from "@/types/compliance";
import { format } from "date-fns";
import { CheckCircle, XCircle, User, GraduationCap, Briefcase, FileText } from "lucide-react";

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

  // Get section icon
  const getSectionIcon = (title: string) => {
    switch (title) {
      case "Personal Information":
        return <User className="h-5 w-5 text-nexed-600" />;
      case "Visa Information":
        return <FileText className="h-5 w-5 text-nexed-600" />;
      case "Academic Information":
        return <GraduationCap className="h-5 w-5 text-nexed-600" />;
      case "Employment Information":
        return <Briefcase className="h-5 w-5 text-nexed-600" />;
      default:
        return <FileText className="h-5 w-5 text-nexed-600" />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-nexed-800 mb-2">
            🎉 Welcome to neXed!
          </DialogTitle>
          <p className="text-gray-600 text-base">
            Your profile setup is complete. Let's review your information and get you started.
          </p>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Progress Section */}
          <div className="bg-gradient-to-r from-nexed-50 to-blue-50 p-6 rounded-lg border border-nexed-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-nexed-800">Profile Completion</h3>
                <p className="text-gray-600 text-sm">
                  {completedItems} of {totalItems} items completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-nexed-600">{completionPercentage}%</span>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
            
            <Progress 
              value={completionPercentage} 
              className="h-3 bg-white shadow-inner" 
              indicatorClassName="bg-gradient-to-r from-nexed-500 to-nexed-600"
            />
          </div>
          
          {/* Profile Quick Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-nexed-800 flex items-center">
              <User className="h-5 w-5 mr-2 text-nexed-600" />
              Profile Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Name</p>
                <p className="text-gray-800">{userData.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Visa Type</p>
                <p className="text-gray-800">{userData.visaType || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">University</p>
                <p className="text-gray-800">{userData.university || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Field of Study</p>
                <p className="text-gray-800">{userData.fieldOfStudy || "Not provided"}</p>
              </div>
            </div>
          </div>
          
          {/* Detailed Checklist Sections */}
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-nexed-800 flex items-center">
                    {getSectionIcon(section.title)}
                    <span className="ml-2">{section.title}</span>
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        {item.complete ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="text-gray-800 font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm text-gray-600 max-w-xs text-right">
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

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-nexed-500 to-nexed-600 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
            <p className="text-nexed-100 mb-4">
              We'll now generate personalized compliance tasks based on your profile to help you stay on track with your visa requirements.
            </p>
            <Button 
              onClick={async () => await onContinue()} 
              disabled={loading}
              className="bg-white text-nexed-600 hover:bg-gray-100 font-semibold px-6 py-2"
            >
              {loading ? "Setting up your dashboard..." : "Continue to Dashboard"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceChecklist;
