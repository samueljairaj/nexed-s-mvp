
import React from "react";
import { Link } from "react-router-dom";
import { FileCheck, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ComplianceChecklistProps {
  complianceProgress: number;
  tasksCount: {
    total: number;
    completed: number;
  };
  isGenerating?: boolean;
}

const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ 
  complianceProgress, 
  tasksCount,
  isGenerating 
}) => {
  const sampleTasks = [
    "Submit I-94 form",
    "Update SEVIS address",
    "Complete health insurance"
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium text-nexed-800">Compliance Checklist</CardTitle>
          <CardDescription className="text-xs">Task completion progress</CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" className="h-6 w-6">
          <Link to="/app/compliance">
            <ArrowRight size={14} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="mb-2 flex justify-between text-xs">
          <span>{complianceProgress}% complete</span>
          <span className="text-nexed-600 font-medium">{tasksCount.completed} of {tasksCount.total} tasks</span>
        </div>
        <Progress value={complianceProgress} className="h-1.5 mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {sampleTasks.map((task, index) => (
            <div key={index} className="flex items-center bg-green-50 p-2 rounded-md">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                <FileCheck size={12} />
              </div>
              <span className="text-xs">{task}</span>
            </div>
          ))}
          
          <Button asChild variant="outline" size="sm" className="flex items-center justify-center h-[34px]">
            <Link to="/app/compliance" className="flex gap-1 text-xs">
              <span>View all</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceChecklist;
