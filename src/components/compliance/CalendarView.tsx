
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/hooks/useComplianceTasks";
import { dateUtils, DateRange } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar as CalendarIcon } from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  onDateClick?: (date: Date, tasks: Task[]) => void;
}

export function CalendarView({ tasks, onDateClick }: CalendarViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Find days with tasks
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Create a decorator for the calendar to highlight dates with tasks
  const decorators = tasks
    .map(task => new Date(task.dueDate))
    .reduce((acc, date) => {
      const dateStr = date.toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date,
          tasks: getTasksForDate(date),
        };
      }
      return acc;
    }, {} as Record<string, { date: Date; tasks: Task[] }>);

  // Render calendar day with potential badges for tasks
  const renderDay = (day: Date) => {
    const tasksForDay = getTasksForDate(day);
    const highPriorityTasks = tasksForDay.filter(task => task.priority === "high");
    const mediumPriorityTasks = tasksForDay.filter(task => task.priority === "medium");
    const lowPriorityTasks = tasksForDay.filter(task => task.priority === "low");
    
    if (tasksForDay.length === 0) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <div className="flex gap-0.5 mb-0.5">
                {highPriorityTasks.length > 0 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
                {mediumPriorityTasks.length > 0 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-nexed-500" />
                )}
                {lowPriorityTasks.length > 0 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-2 max-w-[250px]">
            <div className="space-y-1">
              <p className="font-medium text-sm">{dateUtils.formatDate(day)}</p>
              <ul className="text-xs space-y-0.5 max-h-[150px] overflow-y-auto">
                {tasksForDay.map((task, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.priority === "high"
                          ? "bg-red-500"
                          : task.priority === "medium"
                          ? "bg-nexed-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <span>{task.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Handle date click to show tasks
  const handleDayClick = (day: Date | undefined) => {
    if (day && onDateClick) {
      const tasksForDay = getTasksForDate(day);
      onDateClick(day, tasksForDay);
    }
  };

  return (
    <Card className="nexed-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-nexed-600" />
          Compliance Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          onDayClick={handleDayClick}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          className="rounded-md border"
          components={{
            Day: ({ date, ...props }) => (
              <div className="relative h-9 w-9 p-0 font-normal">
                <div className="flex h-full w-full items-center justify-center">
                  {date.getDate()}
                </div>
                {renderDay(date)}
              </div>
            ),
          }}
        />
      </CardContent>
    </Card>
  );
}
