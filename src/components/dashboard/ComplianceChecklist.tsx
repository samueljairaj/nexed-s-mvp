
import React from "react";
import { Link } from "react-router-dom";
import { FileCheck } from "lucide-react";
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
    <Card className="nexed-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Compliance Checklist</CardTitle>
        <CardDescription>Task completion progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between text-sm">
          <span>{complianceProgress}% complete</span>
          <span className="text-nexed-600 font-medium">{tasksCount.completed} of {tasksCount.total} tasks</span>
        </div>
        <Progress value={complianceProgress} className="h-2" />
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/app/compliance" className="flex gap-2">
              <FileCheck size={16} /> View Tasks
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceChecklist;
