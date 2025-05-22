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
import { toast } from "sonner";

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
  onContinue: () => void;
}

interface GroupedDocuments {
  immigration: AITask[];
  employment: AITask[];
  educational: AITask[];
  personal: AITask[];
}

type DatabaseVisaType = "F1" | "OPT" | "H1B" | "Other";

export function ComplianceChecklist({ open, onOpenChange, userData, onContinue }: ComplianceChecklistProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all-documents");
  const { generateCompliance, isGenerating } = useAICompliance();
  const [documents, setDocuments] = useState<GroupedDocuments>({
    immigration: [],
    employment: [],
    educational: [],
    personal: []
  });
  const [phaseGroups, setPhaseGroups] = useState<{[key: string]: AITask[]}>({});
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const mergedUserData = {
    name: userData.name || currentUser?.name || "",
    visaType: userData.visaType || currentUser?.visaType || "F1",
    university: userData.university || currentUser?.university || "",
    fieldOfStudy: userData.fieldOfStudy || currentUser?.fieldOfStudy || "",
    employer: userData.employer || currentUser?.employerName || currentUser?.employer || ""
  };
  
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
  
  // Load initial data when dialog opens
  useEffect(() => {
    if (open) {
      console.log("ComplianceChecklist opened", { userData, currentUser });
      loadTasks();
    }
  }, [open, currentUser?.id]);
  
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
  
  const normalizeVisaType = (visaType: string | undefined): DatabaseVisaType => {
    if (!visaType) return "Other";
    
    const upperVisaType = visaType.toUpperCase();
    if (upperVisaType === "F1" || upperVisaType === "F-1") return "F1";
    if (upperVisaType === "OPT") return "OPT";
    if (upperVisaType === "H1B" || upperVisaType === "H-1B") return "H1B";
    if (upperVisaType === "J1" || upperVisaType === "J-1") return "Other";
    return "Other";
  };
  
  const saveGeneratedTasksToDatabase = async (tasks: AITask[]) => {
    if (!currentUser?.id) return;
    
    try {
      const dbTasks = tasks.map(task => {
        return {
          user_id: currentUser.id,
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          is_completed: task.completed || false,
          category: task.category as DocumentCategory,
          phase: task.phase || 'general',
          priority: task.priority || 'medium',
          visa_type: normalizeVisaType(currentUser.visaType)
        };
      });
      
      const { error } = await supabase
        .from('compliance_tasks')
        .upsert(dbTasks, {
          onConflict: 'user_id,title,phase'
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

  const loadTasks = async () => {
    if (!currentUser?.id) {
      console.error("No current user found");
      return;
    }
    
    setLoadingState("loading");
    
    try {
      // First check if we already have tasks in the database
      const { data: existingTasks, error: fetchError } = await supabase
        .from('compliance_tasks')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (fetchError) {
        throw fetchError;
      }
      
      // If we have existing tasks, use those
      if (existingTasks && existingTasks.length > 0) {
        console.log("Found existing tasks:", existingTasks.length);
        processTasks(existingTasks);
        setLoadingState("success");
        return;
      }
      
      // Otherwise, generate new tasks
      console.log("No existing tasks found, generating new ones");
      const generatedTasks = await generateCompliance({
        ...mergedUserData,
        email: currentUser.email
      });
      
      if (generatedTasks && generatedTasks.length > 0) {
        processTasks(generatedTasks);
        await saveGeneratedTasksToDatabase(generatedTasks);
        setLoadingState("success");
        toast.success("Generated personalized compliance checklist");
      } else {
        console.error("No tasks were generated");
        setLoadingState("error");
      }
    } catch (error) {
      console.error("Error loading compliance tasks:", error);
      setLoadingState("error");
    }
  };
  
  const processTasks = (tasks: any[]) => {
    // Group by category
    const groupedByCategory: GroupedDocuments = {
      immigration: [],
      employment: [],
      educational: [],
      personal: []
    };
    
    // Group by phase
    const groupedByPhase: {[key: string]: AITask[]} = {};
    
    tasks.forEach(task => {
      // Add to category group
      const category = (task.category || 'personal').toLowerCase();
      if (groupedByCategory[category as keyof GroupedDocuments]) {
        groupedByCategory[category as keyof GroupedDocuments].push(task);
      } else {
        groupedByCategory.personal.push(task);
      }
      
      // Add to phase group
      const phase = task.phase || 'general';
      if (!groupedByPhase[phase]) {
        groupedByPhase[phase] = [];
      }
      groupedByPhase[phase].push(task);
    });
    
    setDocuments(groupedByCategory);
    setPhaseGroups(groupedByPhase);
  };
  
  const handleTabChange = (value: string) => {
    setTab(value);
  };
  
  const handleContinue = () => {
    onContinue();
  };
  
  const handleUploadDocs = () => {
    onOpenChange(false);
    navigate('/app/documents');
  };
  
  const handleViewTasks = () => {
    onOpenChange(false);
    navigate('/app/compliance');
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'immigration': return <FileCheck className="h-5 w-5 text-blue-500" />;
      case 'employment': return <Briefcase className="h-5 w-5 text-amber-500" />;
      case 'educational': return <GraduationCap className="h-5 w-5 text-green-500" />;
      case 'personal': return <User className="h-5 w-5 text-purple-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Compliance Checklist</DialogTitle>
          <DialogDescription>
            Review and complete your compliance tasks
          </DialogDescription>
        </DialogHeader>
        
        {loadingState === "loading" || isGenerating ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-nexed-500 mb-4" />
            <p className="text-lg font-medium">Generating your personalized compliance checklist...</p>
            <p className="text-gray-500">This will just take a moment</p>
          </div>
        ) : loadingState === "error" ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-medium">Unable to generate compliance checklist</p>
            <p className="text-gray-500 mb-6">Please try again later</p>
            <Button onClick={loadTasks}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="bg-nexed-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-nexed-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Your Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">University:</span> {studentInfo.university}
                </div>
                <div>
                  <span className="text-gray-500">Program:</span> {studentInfo.program}
                </div>
                <div>
                  <span className="text-gray-500">US Entry:</span> {studentInfo.recentUSEntry}
                </div>
                <div>
                  <span className="text-gray-500">Visa Expiry:</span> {studentInfo.visaExpiration}
                </div>
                {mergedUserData.visaType === "F1" && (
                  <>
                    <div>
                      <span className="text-gray-500">I-20 End Date:</span> {studentInfo.i20EndDate}
                    </div>
                  </>
                )}
                {(mergedUserData.visaType === "OPT" || mergedUserData.visaType === "STEM OPT") && (
                  <>
                    <div>
                      <span className="text-gray-500">OPT Start:</span> {studentInfo.optStartDate}
                    </div>
                    <div>
                      <span className="text-gray-500">OPT End:</span> {studentInfo.optEndDate}
                    </div>
                    <div>
                      <span className="text-gray-500">Employer:</span> {studentInfo.employer}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="all-documents" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all-documents">All Documents</TabsTrigger>
                <TabsTrigger value="priority-documents">Priority</TabsTrigger>
                <TabsTrigger value="phases">Phases</TabsTrigger>
                <TabsTrigger value="calendar">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all-documents" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Immigration Documents */}
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <FileCheck className="h-5 w-5 text-blue-500 mr-2" />
                      Immigration Documents
                    </h3>
                    <ul className="space-y-2">
                      {documents.immigration.length > 0 ? (
                        documents.immigration.map((doc, index) => (
                          <li key={`imm-${index}`} className="flex items-start">
                            <Checkbox 
                              id={`imm-${index}`} 
                              className="mt-1"
                              checked={doc.completed} 
                            />
                            <label 
                              htmlFor={`imm-${index}`}
                              className="ml-2 text-sm"
                            >
                              {doc.title}
                            </label>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No immigration documents found</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Employment Documents */}
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <Briefcase className="h-5 w-5 text-amber-500 mr-2" />
                      Employment Documents
                    </h3>
                    <ul className="space-y-2">
                      {documents.employment.length > 0 ? (
                        documents.employment.map((doc, index) => (
                          <li key={`emp-${index}`} className="flex items-start">
                            <Checkbox 
                              id={`emp-${index}`} 
                              className="mt-1"
                              checked={doc.completed} 
                            />
                            <label 
                              htmlFor={`emp-${index}`}
                              className="ml-2 text-sm"
                            >
                              {doc.title}
                            </label>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No employment documents found</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Educational Documents */}
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <GraduationCap className="h-5 w-5 text-green-500 mr-2" />
                      Educational Documents
                    </h3>
                    <ul className="space-y-2">
                      {documents.educational.length > 0 ? (
                        documents.educational.map((doc, index) => (
                          <li key={`edu-${index}`} className="flex items-start">
                            <Checkbox 
                              id={`edu-${index}`} 
                              className="mt-1"
                              checked={doc.completed} 
                            />
                            <label 
                              htmlFor={`edu-${index}`}
                              className="ml-2 text-sm"
                            >
                              {doc.title}
                            </label>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No educational documents found</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Personal Documents */}
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <User className="h-5 w-5 text-purple-500 mr-2" />
                      Personal Documents
                    </h3>
                    <ul className="space-y-2">
                      {documents.personal.length > 0 ? (
                        documents.personal.map((doc, index) => (
                          <li key={`per-${index}`} className="flex items-start">
                            <Checkbox 
                              id={`per-${index}`} 
                              className="mt-1"
                              checked={doc.completed} 
                            />
                            <label 
                              htmlFor={`per-${index}`}
                              className="ml-2 text-sm"
                            >
                              {doc.title}
                            </label>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No personal documents found</li>
                      )}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="priority-documents">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium text-lg mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    Priority Documents
                  </h3>
                  
                  <ul className="space-y-3">
                    {Object.values(documents)
                      .flat()
                      .filter(doc => doc.priority === 'high')
                      .map((doc, index) => (
                        <li key={`prio-${index}`} className="flex items-start pb-3 border-b last:border-0">
                          <Checkbox 
                            id={`prio-${index}`} 
                            className="mt-1"
                            checked={doc.completed} 
                          />
                          <div className="ml-2">
                            <label 
                              htmlFor={`prio-${index}`}
                              className="font-medium text-sm block"
                            >
                              {doc.title}
                            </label>
                            <span className="text-xs text-gray-500 flex items-center mt-1">
                              {getCategoryIcon(doc.category)}
                              <span className="ml-1 capitalize">{doc.category}</span>
                              {doc.dueDate && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>Due: {formatDateDisplay(doc.dueDate)}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                      
                    {Object.values(documents)
                      .flat()
                      .filter(doc => doc.priority === 'high').length === 0 && (
                      <li className="text-center py-4 text-gray-500">
                        <p>No priority documents found</p>
                      </li>
                    )}
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="phases">
                <div className="space-y-4">
                  {Object.keys(phaseGroups).length > 0 ? (
                    Object.entries(phaseGroups).map(([phase, tasks]) => (
                      <div key={phase} className="bg-white rounded-lg border p-4">
                        <h3 className="font-medium text-lg mb-3 capitalize">
                          {phase === 'general' ? 'General Tasks' : phase}
                        </h3>
                        <ul className="space-y-2">
                          {tasks.map((task, index) => (
                            <li key={`phase-${phase}-${index}`} className="flex items-start">
                              <Checkbox 
                                id={`phase-${phase}-${index}`} 
                                className="mt-1"
                                checked={task.completed} 
                              />
                              <div className="ml-2">
                                <label 
                                  htmlFor={`phase-${phase}-${index}`}
                                  className="text-sm"
                                >
                                  {task.title}
                                </label>
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  {getCategoryIcon(task.category)}
                                  <span className="ml-1 capitalize">{task.category}</span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No phases found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium text-lg mb-4">Timeline</h3>
                  
                  <div className="space-y-6">
                    {Object.values(documents)
                      .flat()
                      .filter(doc => doc.dueDate)
                      .sort((a, b) => {
                        if (!a.dueDate || !b.dueDate) return 0;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                      })
                      .map((doc, index) => (
                        <div key={`timeline-${index}`} className="relative pl-6 pb-4">
                          {/* Timeline connector */}
                          {index < Object.values(documents).flat().filter(d => d.dueDate).length - 1 && (
                            <div className="absolute left-[9px] top-[18px] bottom-0 w-[2px] bg-gray-200"></div>
                          )}
                          
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-[6px] h-[18px] w-[18px] rounded-full border-2 ${
                            doc.completed ? 'bg-green-100 border-green-500' : 'bg-white border-nexed-500'
                          }`}></div>
                          
                          <div>
                            <span className="text-sm font-medium block">{formatDateDisplay(doc.dueDate)}</span>
                            <div className="flex items-start mt-1">
                              <Checkbox 
                                id={`timeline-${index}`} 
                                className="mt-1"
                                checked={doc.completed} 
                              />
                              <div className="ml-2">
                                <label 
                                  htmlFor={`timeline-${index}`}
                                  className="text-sm font-medium"
                                >
                                  {doc.title}
                                </label>
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  {getCategoryIcon(doc.category)}
                                  <span className="ml-1 capitalize">{doc.category}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                    {Object.values(documents)
                      .flat()
                      .filter(doc => doc.dueDate).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No timeline data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleUploadDocs}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleViewTasks}
                  className="flex items-center"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  View All Tasks
                </Button>
              </div>
              <Button onClick={handleContinue}>
                Continue to Dashboard
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
