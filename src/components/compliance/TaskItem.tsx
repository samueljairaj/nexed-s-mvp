
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Task } from "@/hooks/useComplianceTasks";

interface TaskItemProps {
  task: Task;
  toggleTaskStatus: (id: string) => void;
}

export function TaskItem({ task, toggleTaskStatus }: TaskItemProps) {
  return (
    <Card 
      className={`${task.completed ? 'bg-gray-50' : ''}`}
      hover={!task.completed}
    >
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
              <div className="ml-4 flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="capitalize">
                  {task.category}
                </Badge>
                <Badge 
                  variant={
                    task.priority === "high" ? "danger" : 
                    task.priority === "medium" ? "warning" : 
                    "success"
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
