
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-hooks";
import { toast } from "sonner";
import { useEmploymentInfo } from "@/hooks/onboarding/useEmploymentInfo";
import type { EmploymentInfoFormValues } from "@/types/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export function EmploymentProfileSection() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { 
    employmentData, 
    setEmploymentData, 
    handleEmploymentInfo, 
    handleEmploymentStatusChange,
    isSubmitting 
  } = useEmploymentInfo();
  
  // Initialize employment data from user profile when component mounts
  useEffect(() => {
    if (currentUser) {
      setEmploymentData({
        employmentStatus: currentUser.employmentStatus as "Employed" | "Not Employed" || "Not Employed",
        employerName: currentUser.employerName || "",
        jobTitle: currentUser.jobTitle || "",
        employmentStartDate: currentUser.employmentStartDate ? new Date(currentUser.employmentStartDate) : undefined,
        employmentEndDate: undefined,
        // Removing jobLocation from here since it doesn't exist in database
        isFieldRelated: "No",
        authorizationType: (currentUser.authType as "None" | "CPT" | "OPT" | "STEM OPT") || "None",
        authStartDate: currentUser.authStartDate ? new Date(currentUser.authStartDate) : undefined,
        authEndDate: currentUser.authEndDate ? new Date(currentUser.authEndDate) : undefined,
        eadNumber: currentUser.eadNumber || "",
        unemploymentDaysUsed: currentUser.unemploymentDays || "",
        eVerifyNumber: currentUser.eVerifyNumber || "",
        previousEmployers: []
      });
    }
  }, [currentUser, setEmploymentData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: EmploymentInfoFormValues = {
      employmentStatus: employmentData.employmentStatus,
      employerName: employmentData.employerName || "",
      jobTitle: employmentData.jobTitle || "",
      employmentStartDate: employmentData.employmentStartDate ?? null,
      employmentEndDate: employmentData.employmentEndDate ?? null,
      isFieldRelated: employmentData.isFieldRelated === "Yes",
      // Map auth* -> optCpt* for compatibility with the form type
      optCptStartDate: employmentData.authStartDate ?? null,
      optCptEndDate: employmentData.authEndDate ?? null,
      eadNumber: employmentData.eadNumber || "",
      // Map eVerifyNumber -> stemEVerify
      stemEVerify: employmentData.eVerifyNumber || "",
      // Not collected here; set null or wire it up if available
      stemI983Date: null,
    };
    const success = await handleEmploymentInfo(payload);
    if (success) {
      setIsEditing(false);
      toast.success("Employment information updated successfully");
    }
  };

  // Format date safely with a fallback
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "Not specified";
    try {
      // Handle both string and Date inputs
      if (typeof date === 'string') {
        return format(parseISO(date), "MMM d, yyyy");
      } else {
        return format(date, "MMM d, yyyy");
      }
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employment Information</CardTitle>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select 
                value={employmentData.employmentStatus} 
                onValueChange={(value) => handleEmploymentStatusChange(value as "Employed" | "Not Employed")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Not Employed">Not Employed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {employmentData.employmentStatus === "Employed" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input 
                    id="employerName" 
                    value={employmentData.employerName} 
                    onChange={(e) => setEmploymentData(prev => ({ ...prev, employerName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    value={employmentData.jobTitle} 
                    onChange={(e) => setEmploymentData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentStartDate">Employment Start Date</Label>
                  <DatePicker
                    date={employmentData.employmentStartDate}
                    onDateChange={(date) => setEmploymentData(prev => ({ ...prev, employmentStartDate: date }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorizationType">Authorization Type</Label>
                  <Select 
                    value={employmentData.authorizationType || "None"} 
                    onValueChange={(value) => setEmploymentData(prev => ({ 
                      ...prev, 
                      authorizationType: value as "None" | "CPT" | "OPT" | "STEM OPT" 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select authorization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="CPT">CPT</SelectItem>
                      <SelectItem value="OPT">OPT</SelectItem>
                      <SelectItem value="STEM OPT">STEM OPT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {employmentData.authorizationType !== "None" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="authStartDate">Authorization Start Date</Label>
                      <DatePicker
                        date={employmentData.authStartDate}
                        onDateChange={(date) => setEmploymentData(prev => ({ ...prev, authStartDate: date }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authEndDate">Authorization End Date</Label>
                      <DatePicker
                        date={employmentData.authEndDate}
                        onDateChange={(date) => setEmploymentData(prev => ({ ...prev, authEndDate: date }))}
                      />
                    </div>

                    {employmentData.authorizationType === "OPT" || employmentData.authorizationType === "STEM OPT" ? (
                      <div className="space-y-2">
                        <Label htmlFor="eadNumber">EAD Number</Label>
                        <Input 
                          id="eadNumber" 
                          value={employmentData.eadNumber} 
                          onChange={(e) => setEmploymentData(prev => ({ ...prev, eadNumber: e.target.value }))}
                        />
                      </div>
                    ) : null}

                    {employmentData.authorizationType === "STEM OPT" && (
                      <div className="space-y-2">
                        <Label htmlFor="eVerifyNumber">E-Verify Number</Label>
                        <Input 
                          id="eVerifyNumber" 
                          value={employmentData.eVerifyNumber} 
                          onChange={(e) => setEmploymentData(prev => ({ ...prev, eVerifyNumber: e.target.value }))}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Employment Status:</span>
              <p className="font-medium">{currentUser?.employmentStatus || "Not specified"}</p>
            </div>
            
            {currentUser?.employmentStatus === "Employed" && (
              <>
                <div>
                  <span className="text-sm text-gray-500">Employer:</span>
                  <p className="font-medium">{currentUser?.employerName || "Not specified"}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Job Title:</span>
                  <p className="font-medium">{currentUser?.jobTitle || "Not specified"}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Start Date:</span>
                  <p className="font-medium">{currentUser?.employmentStartDate ? formatDate(currentUser.employmentStartDate) : "Not specified"}</p>
                </div>
                
                {currentUser?.authType && (
                  <>
                    <div>
                      <span className="text-sm text-gray-500">Authorization:</span>
                      <p className="font-medium">{currentUser.authType}</p>
                    </div>
                    
                    {(currentUser.authType === "OPT" || currentUser.authType === "STEM OPT") && (
                      <div>
                        <span className="text-sm text-gray-500">EAD Number:</span>
                        <p className="font-medium">{currentUser.eadNumber || "Not specified"}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
