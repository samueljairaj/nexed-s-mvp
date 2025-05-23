
import React from "react";
import { Link } from "react-router-dom";
import { FileCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ComplianceChecklistProps {
  complianceProgress: number;
  tasksCount: {
    total: number;
    completed: number;
  };
}

const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ complianceProgress, tasksCount }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">Compliance Checklist</CardTitle>
          <CardDescription>Task completion progress</CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/app/compliance">
            <ArrowRight size={16} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between text-sm">
          <span>{complianceProgress}% complete</span>
          <span className="text-nexed-600 font-medium">{tasksCount.completed} of {tasksCount.total} tasks</span>
        </div>
        <Progress value={complianceProgress} className="h-2 mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {["Submit I-94 form", "Update SEVIS address", "Complete health insurance"].map((task, index) => (
            <div key={index} className="flex items-center bg-gray-50 p-3 rounded-md">
              <div className="h-6 w-6 rounded-full bg-nexed-100 flex items-center justify-center text-nexed-600 mr-3">
                <FileCheck size={14} />
              </div>
              <span className="text-sm">{task}</span>
            </div>
          ))}
          
          <Button asChild variant="outline" size="sm" className="flex items-center justify-center">
            <Link to="/app/compliance" className="flex gap-1 h-full">
              <span>View all</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceChecklist;
