
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInDays, isValid } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Task } from "@/hooks/useComplianceTasks";

interface TimelineViewProps {
  tasks: Task[];
}

export function TimelineView({ tasks }: TimelineViewProps) {
  // Sort tasks by due date (completed at the end)
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Put completed tasks at the end
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      // Sort by due date - safely handle potentially invalid dates
      try {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        
        if (!isValid(dateA) && !isValid(dateB)) return 0;
        if (!isValid(dateA)) return 1;
        if (!isValid(dateB)) return -1;
        
        return dateA.getTime() - dateB.getTime();
      } catch (e) {
        console.error("Error comparing dates:", e);
        return 0;
      }
    });
  }, [tasks]);

  // If no tasks, show empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-gray-400 mb-2">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-lg font-medium mb-1">No tasks available</h3>
        <p className="text-gray-500">There are no tasks to display in the timeline view</p>
      </div>
    );
  }

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Upcoming Requirements</h2>
        <Button variant="outline" size="sm" className="text-blue-600">
          Export Timeline
        </Button>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-200"></div>
        
        {/* Timeline items */}
        <div className="space-y-10">
          {sortedTasks.map(task => {
            // Calculate days left or "Completed" status
            let daysText = "Completed";
            let statusColor = "bg-green-500";
            
            if (!task.completed) {
              try {
                const today = new Date();
                const dueDate = new Date(task.dueDate);
                
                // Check if the due date is valid before proceeding
                if (isValid(dueDate)) {
                  const daysLeft = differenceInDays(dueDate, today);
                  
                  daysText = daysLeft > 0 ? `${daysLeft} days left` : 
                            daysLeft === 0 ? "Due today" : 
                            `${Math.abs(daysLeft)} days overdue`;
                  
                  // Set status color based on days left
                  statusColor = daysLeft > 30 ? "bg-blue-500" : 
                              daysLeft > 14 ? "bg-yellow-400" : 
                              daysLeft >= 0 ? "bg-red-500" : 
                              "bg-red-600";
                } else {
                  daysText = "Invalid date";
                  statusColor = "bg-gray-400";
                }
              } catch (e) {
                console.error("Error calculating days left:", e);
                daysText = "Date error";
                statusColor = "bg-gray-400";
              }
            }

            return (
              <div key={task.id} className="relative pl-12">
                {/* Status dot */}
                <div 
                  className={`absolute left-5 top-1.5 w-4 h-4 rounded-full -translate-x-1/2 border-4 border-white ${statusColor}`}
                />
                
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
                  {/* Date and Status */}
                  <div className="mb-1">
                    {task.completed ? (
                      <div className="text-green-600 flex items-center gap-1 mb-1">
                        <CheckCircle2 size={14} /> 
                        <span>
                          {(() => {
                            try {
                              const dueDate = new Date(task.dueDate);
                              return isValid(dueDate) 
                                ? format(dueDate, "MMMM d, yyyy") 
                                : "Invalid date";
                            } catch (e) {
                              console.error("Error formatting date:", e);
                              return "Invalid date";
                            }
                          })()} - Completed
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-600 mb-1">
                        {(() => {
                          try {
                            const dueDate = new Date(task.dueDate);
                            return isValid(dueDate) 
                              ? format(dueDate, "MMMM d, yyyy") 
                              : "Invalid date";
                          } catch (e) {
                            console.error("Error formatting date:", e);
                            return "Invalid date";
                          }
                        })()} - <span className="text-red-500 font-medium">{daysText}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-4">{task.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.category === "immigration" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                        SEVIS
                      </Badge>
                    )}
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                      F-1 Visa
                    </Badge>
                    {task.title.toLowerCase().includes("opt") && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                        Documents
                      </Badge>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {!task.completed && (
                    <div className="flex flex-wrap gap-2">
                      {task.title.includes("Registration") && (
                        <Button className="bg-blue-600 hover:bg-blue-700">Complete Registration</Button>
                      )}
                      {task.title.includes("Renewal") && (
                        <Button className="bg-blue-600 hover:bg-blue-700">Start Renewal Process</Button>
                      )}
                      {task.title.includes("Application") && (
                        <Button className="bg-blue-600 hover:bg-blue-700">Prepare Application</Button>
                      )}
                      <Button variant="outline">
                        {task.title.includes("Registration") ? "View Instructions" : 
                         task.title.includes("Application") ? "Learn More" : 
                         "View Requirements"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
