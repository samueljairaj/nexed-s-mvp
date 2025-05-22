import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, FileCheck, Upload, User, Briefcase, GraduationCap, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAICompliance, AITask } from "@/hooks/useAICompliance";
import { DocumentCategory } from "@/types/onboarding";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { dateUtils } from "@/lib/date-utils";

interface ComplianceChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    name?: string;
    visaType?: string;
    university?: string;
    fieldOfStudy?: string;
    employer?: string;
  };
  onContinue: () => void; // Callback to continue to dashboard
}

interface GroupedDocuments {
  immigration: AITask[];
  employment: AITask[];
  educational: AITask[];
  personal: AITask[];
}

// Define type for database-accepted visa types
type DatabaseVisaType = "F1" | "OPT" | "H1B" | "Other";

export function ComplianceChecklist({ open, onOpenChange, userData, onContinue }: ComplianceChecklistProps) {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("all-documents");
  const { generateCompliance, isGenerating } = useAICompliance();
  const [documents, setDocuments] = useState<GroupedDocuments>({
    immigration: [],
    employment: [],
    educational: [],
    personal: []
  });
  // State for phase-based grouping
  const [phaseGroups, setPhaseGroups] = useState<{[key: string]: AITask[]}>({});
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  // Merge userData and currentUser data to ensure we have the most complete information
  const mergedUserData = {
    name: userData.name || currentUser?.name || "",
    visaType: userData.visaType || currentUser?.visaType || "F1",
    university: userData.university || currentUser?.university || "",
    fieldOfStudy: userData.fieldOfStudy || currentUser?.fieldOfStudy || "",
    employer: userData.employer || currentUser?.employerName || currentUser?.employer || ""
  };
  
  // Initial student info from user data
  const [studentInfo, setStudentInfo] = useState({
    university: mergedUserData.university || "Not provided",
    program: mergedUserData.fieldOfStudy || "Not provided",
    optStartDate: currentUser?.courseStartDate ? formatDateDisplay(currentUser.courseStartDate) : "Not provided",
    optEndDate: "Not provided",
    recentUSEntry: currentUser?.usEntryDate ? formatDateDisplay(currentUser.usEntryDate) : "Not provided",
    i20EndDate: "Not provided",
    visaExpiration: currentUser?.visa_expiry_date ? formatDateDisplay(currentUser.visa_expiry_date) : "Not provided",
    employer: mergedUserData.employer || "Not provided",
  });
  
  // Helper function to format dates for display
  function formatDateDisplay(dateString: string | Date | null | undefined): string {
    if (!dateString) return "Not provided";
    
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return String(dateString);
    }
  }
  
  // Helper function to normalize visa types for database compatibility
  const normalizeVisaType = (visaType: string | undefined): DatabaseVisaType => {
    if (visaType === "F1") return "F1";
    if (visaType === "J1" || visaType === "J-1") return "Other";
    if (visaType === "OPT") return "OPT";
    if (visaType === "H1B") return "H1B";
    return "Other";
  };
  
  // Save generated tasks to the database
  const saveGeneratedTasksToDatabase = async (tasks: AITask[]) => {
    if (!currentUser?.id) return;
    
    try {
      // Transform tasks to database format
      const dbTasks = tasks.map(task => {
        return {
          user_id: currentUser.id,
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          is_completed: !!task.completed,
          category: task.category as DocumentCategory,
          phase: task.phase || 'general',
          priority: task.priority || 'medium',
          visa_type: normalizeVisaType(currentUser.visaType)
        };
      });
      
      // Insert the tasks into the database using UPSERT with ON CONFLICT DO NOTHING
      const { error } = await supabase
        .from('compliance_tasks')
        .upsert(dbTasks, {
          onConflict: 'user_id,title,phase',
          ignoreDuplicates: true
        });
        
      if (error) {
        console.error('Error saving compliance tasks to database:', error);
        return false;
      }
      
      console.log('Successfully saved compliance tasks to database');
      return true;
    } catch (error) {
      console.error('Failed to save compliance tasks:', error);
      return false;
    }
  };
  
  // Generate checklist when the component mounts
  useEffect(() => {
    if (open) {
      generateAIChecklist();
    }
  }, [open]);
  
  // Update student info whenever userData or currentUser changes
  useEffect(() => {
    const mergedData = {
      name: userData.name || currentUser?.name || "",
      visaType: userData.visaType || currentUser?.visaType || "F1",
      university: userData.university || currentUser?.university || "",
      fieldOfStudy: userData.fieldOfStudy || currentUser?.fieldOfStudy || "",
      employer: userData.employer || currentUser?.employerName || currentUser?.employer || ""
    };
    
    setStudentInfo({
      university: mergedData.university || "Not provided",
      program: mergedData.fieldOfStudy || "Not provided",
      optStartDate: currentUser?.courseStartDate ? formatDateDisplay(currentUser.courseStartDate) : "Not provided",
      optEndDate: "Not provided", 
      recentUSEntry: currentUser?.usEntryDate ? formatDateDisplay(currentUser.usEntryDate) : "Not provided",
      i20EndDate: "Not provided",
      visaExpiration: currentUser?.visa_expiry_date ? formatDateDisplay(currentUser.visa_expiry_date) : "Not provided",
      employer: mergedData.employer || "Not provided",
    });
    
    console.log("Updated user data for compliance checklist:", mergedData);
  }, [userData, currentUser]);
  
  const generateAIChecklist = async () => {
    if (isGenerating) return;
    
    setLoadingState("loading");
    
    try {
      // Use the merged data to ensure we have the most complete information
      const mergedData = {
        name: userData.name || currentUser?.name || "",
        visaType: userData.visaType || currentUser?.visaType || "F1",
        university: userData.university || currentUser?.university || "",
        fieldOfStudy: userData.fieldOfStudy || currentUser?.fieldOfStudy || "",
        employer: userData.employer || currentUser?.employerName || currentUser?.employer || ""
      };
      
      console.log("Generating compliance with merged data:", mergedData);
      const tasks = await generateCompliance(mergedData);
      
      // Save the generated tasks to the database
      if (currentUser?.id) {
        saveGeneratedTasksToDatabase(tasks);
      }
      
      // Categorize tasks by traditional categories
      const categorizedTasks = {
        immigration: tasks.filter(task => task.category === "immigration"),
        employment: tasks.filter(task => task.category === "employment"),
        educational: tasks.filter(task => task.category === "education" || task.category === "academic"),
        personal: tasks.filter(task => task.category === "personal")
      };
      
      // Also group tasks by visa phase
      const groupedByPhase = tasks.reduce((groups, task) => {
        const phase = task.phase || "general";
        if (!groups[phase]) {
          groups[phase] = [];
        }
        groups[phase].push(task);
        return groups;
      }, {} as {[key: string]: AITask[]});
      
      setDocuments(categorizedTasks);
      setPhaseGroups(groupedByPhase);
      setLoadingState("success");
    } catch (error) {
      console.error("Error generating checklist:", error);
      setLoadingState("error");
    }
  };

  // Count documents
  const totalDocuments = Object.values(documents).reduce(
    (acc, category) => acc + category.length, 
    0
  );
  
  const requiredDocuments = Object.values(documents).reduce(
    (acc, category) => acc + category.filter(doc => doc.priority !== "low").length, 
    0
  );

  // Generate insights based on tasks
  const generateInsights = () => {
    const allTasks = [
      ...documents.immigration,
      ...documents.employment,
      ...documents.educational,
      ...documents.personal
    ];
    
    const insights = [];
    
    // Check for time-sensitive tasks
    const urgentTasks = allTasks.filter(task => 
      task.priority === "high" && 
      new Date(task.dueDate) > new Date()
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    if (urgentTasks.length > 0) {
      insights.push(`Submit ${urgentTasks[0].title} by ${new Date(urgentTasks[0].dueDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`);
    }
    
    // Check for employer verification if employed
    if (userData.employer) {
      insights.push(`Request an employment verification letter that specifically mentions how your role at ${userData.employer} relates to your ${userData.fieldOfStudy || "degree"}`);
    }
    
    // Add visa renewal planning if visa expiration exists
    const visaExpiry = studentInfo.visaExpiration;
    if (visaExpiry && visaExpiry !== "Not provided") {
      try {
        // Only attempt if we have an actual date
        const expiryDate = new Date(visaExpiry);
        const twoBefore = new Date(expiryDate);
        twoBefore.setDate(twoBefore.getDate() - 60);
        
        insights.push(`Start visa renewal planning by ${twoBefore.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} (2 months before expiration) if you intend to travel internationally`);
      } catch (e) {
        insights.push(`Plan your visa renewal well ahead of the expiration date (${visaExpiry})`);
      }
    }
    
    // Add STEM OPT extension if applicable
    if (userData.fieldOfStudy && ["computer science", "engineering", "mathematics", "technology"].some(stem => userData.fieldOfStudy?.toLowerCase().includes(stem))) {
      insights.push(`Consider that you'll be eligible for 24-month STEM OPT extension after your initial OPT period`);
    }
    
    // Add unemployment grace period reminder
    if (studentInfo.recentUSEntry && studentInfo.recentUSEntry !== "Not provided") {
      insights.push(`Based on your I-94 entry date of ${studentInfo.recentUSEntry}, you must maintain continuous employment with no more than 90 cumulative days of unemployment`);
    } else {
      insights.push(`Remember that F-1 OPT students must maintain continuous employment with no more than 90 cumulative days of unemployment`);
    }
    
    return insights;
  };

  const insights = generateInsights();

  // Render document list based on category
  const renderDocumentList = (category: keyof GroupedDocuments) => {
    if (loadingState === "loading") {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Generating your personalized checklist...</p>
        </div>
      );
    }
    
    if (loadingState === "error") {
      return (
        <div className="border rounded-lg p-4 mb-3 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Failed to generate checklist</p>
              <p className="text-red-600 text-sm mt-1">Please try again later</p>
              <Button onClick={generateAIChecklist} className="mt-2" size="sm" variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (documents[category].length === 0) {
      return (
        <div className="border rounded-lg p-4 mb-3 bg-gray-50">
          <p className="text-gray-600 text-center py-4">No {category} documents required</p>
        </div>
      );
    }
    
    return documents[category].map((doc) => (
      <div key={doc.id} className="border rounded-lg p-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox id={doc.id} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <label htmlFor={doc.id} className="font-medium text-gray-900 block mb-1">
                {doc.title}
              </label>
              <span className={`text-xs px-2 py-0.5 rounded-full ${doc.priority === "high" ? 'bg-red-100 text-red-700' : doc.priority === "medium" ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {doc.priority === "high" ? 'Required' : doc.priority === "medium" ? 'Important' : 'Recommended'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
            <Button variant="default" size="sm" className="gap-1">
              <Upload size={16} />
              Upload
            </Button>
          </div>
        </div>
      </div>
    ));
  };

  // Render documents grouped by phase
  const renderPhaseDocuments = () => {
    if (loadingState === "loading") {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Generating your personalized checklist...</p>
        </div>
      );
    }
    
    if (loadingState === "error") {
      return (
        <div className="border rounded-lg p-4 mb-3 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Failed to generate checklist</p>
              <p className="text-red-600 text-sm mt-1">Please try again later</p>
              <Button onClick={generateAIChecklist} className="mt-2" size="sm" variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (Object.keys(phaseGroups).length === 0) {
      return (
        <div className="border rounded-lg p-4 mb-3 bg-gray-50">
          <p className="text-gray-600 text-center py-4">No documents found</p>
        </div>
      );
    }
    
    // Order the phases in a logical sequence
    const orderedPhases = ["F1", "CPT", "OPT", "STEM OPT", "J1", "H1B", "general"];
    
    // Sort the phase keys based on the ordered phases
    const sortedPhaseKeys = Object.keys(phaseGroups).sort((a, b) => {
      const indexA = orderedPhases.indexOf(a) !== -1 ? orderedPhases.indexOf(a) : 999;
      const indexB = orderedPhases.indexOf(b) !== -1 ? orderedPhases.indexOf(b) : 999;
      return indexA - indexB;
    });
    
    return sortedPhaseKeys.map(phase => (
      <div key={phase} className="mb-6">
        <h3 className="flex items-center text-lg font-medium mb-3">
          <FileCheck className="mr-2 text-blue-600" size={20} />
          {phase === "general" ? "General Documents" : `${phase} Documents`}
          <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {phaseGroups[phase].length} documents
          </span>
        </h3>
        
        {phaseGroups[phase].map((doc) => (
          <div key={doc.id} className="border rounded-lg p-4 mb-3">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Checkbox id={doc.id} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <label htmlFor={doc.id} className="font-medium text-gray-900 block mb-1">
                    {doc.title}
                  </label>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${doc.priority === "high" ? 'bg-red-100 text-red-700' : doc.priority === "medium" ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {doc.priority === "high" ? 'Required' : doc.priority === "medium" ? 'Important' : 'Recommended'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                <Button variant="default" size="sm" className="gap-1">
                  <Upload size={16} />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Your Personalized Document Checklist</DialogTitle>
          <DialogDescription className="text-center">
            We've created a customized compliance plan based on your visa status
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          {/* AI Analysis Banner */}
          <div className="bg-blue-50 p-4 rounded-md flex items-center mb-4">
            <div className="bg-blue-600 text-white p-2 rounded-full mr-3">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-blue-700 font-medium">
                neXed AI has analyzed your {userData.visaType || "F-1"} status and created a tailored compliance plan based on your specific details.
              </p>
              <div className="flex items-center text-blue-600 text-sm mt-1">
                <div className="flex space-x-1 mr-2">
                  {[1, 2, 3].map(dot => (
                    <div key={dot} className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  ))}
                </div>
                <span>Updating in real-time</span>
              </div>
            </div>
          </div>

          {/* Student Info Section */}
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              {userData.visaType || currentUser?.visaType || "F-1"} Student{userData.visaType === "F1" ? " on OPT (Post-Completion)" : ""}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600">University</p>
                <p className="font-medium">{studentInfo.university}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Program</p>
                <p className="font-medium">{studentInfo.program}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Program Start Date</p>
                <p className="font-medium">{studentInfo.optStartDate}</p>
              </div>
              {studentInfo.optEndDate !== "Not provided" && (
                <div>
                  <p className="text-sm text-blue-600">OPT End Date</p>
                  <p className="font-medium">{studentInfo.optEndDate}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-blue-600">Most Recent US Entry</p>
                <p className="font-medium">{studentInfo.recentUSEntry}</p>
              </div>
              {studentInfo.i20EndDate !== "Not provided" && (
                <div>
                  <p className="text-sm text-blue-600">I-20 Program End Date</p>
                  <p className="font-medium">{studentInfo.i20EndDate}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-blue-600">Visa Expiration</p>
                <p className="font-medium">{studentInfo.visaExpiration}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Employer</p>
                <p className="font-medium">{studentInfo.employer}</p>
              </div>
            </div>
          </div>

          {/* Time-Sensitive Alert - only show if visa expires within 90 days */}
          {currentUser?.visa_expiry_date && new Date(currentUser.visa_expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4 flex">
              <AlertTriangle className="text-amber-500 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-amber-800">Time-Sensitive Requirements:</p>
                <p className="text-amber-700">
                  Your visa expires in {Math.ceil((new Date(currentUser.visa_expiry_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days ({formatDateDisplay(currentUser.visa_expiry_date)}) which falls during your program period. 
                  You should plan to either renew your visa if traveling internationally or prepare for status 
                  adjustment if applicable.
                </p>
              </div>
            </div>
          )}

          {/* Document Tabs */}
          <Tabs defaultValue="by-phase" className="w-full" value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="by-phase">By Visa Phase</TabsTrigger>
              <TabsTrigger value="all-documents">All Documents</TabsTrigger>
              <TabsTrigger value="immigration">Immigration</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="educational">Educational</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="by-phase">
              {renderPhaseDocuments()}
            </TabsContent>
            
            <TabsContent value="all-documents" className="space-y-4">
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <FileCheck className="mr-2 text-blue-600" size={20} />
                  Immigration Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.immigration.length} documents
                  </span>
                </h3>
                {renderDocumentList('immigration')}
              </div>
              
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <Briefcase className="mr-2 text-blue-600" size={20} />
                  Employment Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.employment.length} documents
                  </span>
                </h3>
                {renderDocumentList('employment')}
              </div>
              
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <GraduationCap className="mr-2 text-blue-600" size={20} />
                  Educational Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.educational.length} documents
                  </span>
                </h3>
                {renderDocumentList('educational')}
              </div>
              
              <div className="mb-4">
                <h3 className="flex items-center text-lg font-medium mb-3">
                  <User className="mr-2 text-blue-600" size={20} />
                  Personal Documents
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {documents.personal.length} documents
                  </span>
                </h3>
                {renderDocumentList('personal')}
              </div>
            </TabsContent>
            
            <TabsContent value="immigration">
              {renderDocumentList('immigration')}
            </TabsContent>
            
            <TabsContent value="employment">
              {renderDocumentList('employment')}
            </TabsContent>
            
            <TabsContent value="educational">
              {renderDocumentList('educational')}
            </TabsContent>
            
            <TabsContent value="personal">
              {renderDocumentList('personal')}
            </TabsContent>
          </Tabs>

          {/* Insights Section */}
          <div className="mt-6 border-t pt-6">
            <h3 className="flex items-center text-lg font-medium mb-4">
              <Info className="mr-2 text-blue-600" size={20} />
              Key Insights for Your Situation
            </h3>
            
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li key={index} className="bg-gray-50 p-3 rounded-md flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full text-blue-700 mr-3 mt-0.5">
                    <FileCheck size={16} />
                  </div>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Call to Action for Dashboard */}
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => {
                console.log("Continue to Dashboard button clicked");
                // Close the dialog first
                onOpenChange(false);
                // Use the callback provided by parent
                setTimeout(() => onContinue(), 100);
              }}
              className="px-6 nexed-gradient-button"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
