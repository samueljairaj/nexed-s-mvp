
import React from "react";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calendar } from "lucide-react";
import { Task } from "@/hooks/useComplianceTasks";

interface ComplianceStatusSummaryProps {
  tasks: Task[];
}

export function ComplianceStatusSummary({ tasks }: ComplianceStatusSummaryProps) {
  // Calculate completion progress
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  return (
    <Card className="mb-8 nexed-card">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Task Progress</h3>
            <div className="flex items-center">
              <div className="w-full mr-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{completionPercentage}% Complete</span>
                  <span>{completedTasks} of {tasks.length} tasks</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Priority Tasks</h3>
            <div className="space-y-1">
              {tasks
                .filter(task => !task.completed && task.priority === "high")
                .slice(0, 2)
                .map(task => (
                  <div key={task.id} className="flex items-center">
                    <AlertTriangle size={16} className="text-red-500 mr-2" />
                    <span className="text-gray-700 truncate">{task.title}</span>
                  </div>
                ))}
              {tasks.filter(task => !task.completed && task.priority === "high").length === 0 && (
                <span className="text-gray-500 text-sm italic">No high priority tasks</span>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Upcoming Deadlines</h3>
            <div className="space-y-1">
              {tasks
                .filter(task => !task.completed)
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 2)
                .map(task => (
                  <div key={task.id} className="flex items-center">
                    <Calendar size={16} className="text-nexed-600 mr-2" />
                    <span className="text-gray-700 truncate">{task.title} - {task.dueDate}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
