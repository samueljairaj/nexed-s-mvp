
import React from "react";
import { Task } from "@/hooks/useComplianceTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateUtils } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";

interface DailyTasksProps {
  date: Date | null;
  tasks: Task[];
  toggleTaskStatus: (id: string) => void;
}

export function DailyTasks({ date, tasks, toggleTaskStatus }: DailyTasksProps) {
  if (!date) {
    return (
      <Card className="nexed-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-nexed-600" />
            Select a Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Click on a date in the calendar to view tasks
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get priority badge
  const getPriorityBadge = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <Card className="nexed-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-nexed-600" />
          Tasks for {dateUtils.formatDate(date)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start p-3 border border-gray-100 rounded-md"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={task.completed ? "outline" : "default"}
                  className="ml-2"
                  onClick={() => toggleTaskStatus(task.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {task.completed ? "Completed" : "Complete"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No tasks scheduled for this date
          </p>
        )}
      </CardContent>
    </Card>
  );
}
