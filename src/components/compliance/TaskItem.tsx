
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { DocumentCategory } from "@/types/document";
import { Task } from "@/hooks/useComplianceTasks";

interface TaskItemProps {
  task: Task;
  toggleTaskStatus: (id: string) => void;
}

export function TaskItem({ task, toggleTaskStatus }: TaskItemProps) {
  return (
    <Card className={`nexed-card ${task.completed ? 'bg-gray-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={() => toggleTaskStatus(task.id)}
            className="mt-1 mr-4"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-medium text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                <p className={`mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <Badge variant="outline" className="capitalize">
                  {task.category}
                </Badge>
                <Badge 
                  className={
                    task.priority === "high" ? "bg-red-100 text-red-800 hover:bg-red-100" : 
                    task.priority === "medium" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : 
                    "bg-green-100 text-green-800 hover:bg-green-100"
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <Clock size={14} className="mr-1" />
              <span>Due: {task.dueDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
