
import React from "react";
import { Link } from "react-router-dom";
import { FileCheck, ArrowRight, CheckCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

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
    { name: "Submit I-94 form", dueDate: "May 30, 2025", priority: "high" },
    { name: "Update SEVIS address", dueDate: "June 15, 2025", priority: "medium" },
    { name: "Complete health insurance", dueDate: "July 1, 2025", priority: "high" }
  ];

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium text-nexed-800">Compliance Checklist</CardTitle>
          <CardDescription>Task completion progress</CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/app/compliance">
            <ArrowRight size={16} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{complianceProgress}% complete</span>
            <span className="text-nexed-600 font-medium">{tasksCount.completed} of {tasksCount.total} tasks</span>
          </div>
          <Progress value={complianceProgress} className="h-2" />
        </div>
        
        <Table>
          <TableBody>
            {sampleTasks.map((task, idx) => (
              <TableRow key={idx} className="border-b hover:bg-gray-50">
                <TableCell className="py-3 pl-3 pr-2">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      task.priority === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      <FileCheck size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{task.name}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        Due {task.dueDate}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                  >
                    Complete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Button asChild variant="default" size="sm" className="w-full mt-4">
          <Link to="/app/compliance" className="flex items-center justify-center gap-1">
            <CheckCircle size={16} />
            View All Tasks
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComplianceChecklist;
