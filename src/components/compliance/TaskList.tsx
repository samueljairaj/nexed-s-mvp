
import React from "react";
import { TaskItem } from "./TaskItem";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: "immigration" | "academic" | "employment" | "personal";
  completed: boolean;
  priority: "low" | "medium" | "high";
}

interface TaskListProps {
  tasks: Task[];
  toggleTaskStatus: (id: string) => void;
  emptyMessage: string;
}

export function TaskList({ tasks, toggleTaskStatus, emptyMessage }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          toggleTaskStatus={toggleTaskStatus} 
        />
      ))}
    </div>
  );
}
