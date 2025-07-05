
import React from "react";
import { 
  Calendar, Clock, AlertTriangle, 
  FileCheck, CheckCircle, Calendar as CalendarIcon,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Deadline {
  title: string;
  due_date: string;
  description: string;
  category: string;
  priority: string;
}

interface ComplianceDashboardProps {
  complianceProgress: number;
  tasksCount: {
    total: number;
    completed: number;
  };
  deadlines: Deadline[];
  isGenerating?: boolean;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ 
  complianceProgress, 
  tasksCount,
  deadlines = [],
  isGenerating 
}) => {
  // Sample tasks if none provided
  const sampleTasks = [
    { name: "Submit I-94 form", dueDate: "May 30, 2025", priority: "high" },
    { name: "Update SEVIS address", dueDate: "June 15, 2025", priority: "medium" },
    { name: "Complete health insurance", dueDate: "July 1, 2025", priority: "high" }
  ];

  // Default deadlines if none provided
  const defaultDeadlines = [
    {
      title: "SEVIS Registration for Spring Semester",
      due_date: "2025-01-15",
      description: "Verify your information in SEVIS is accurate",
      category: "immigration",
      priority: "high"
    },
    {
      title: "Submit OPT Progress Report",
      due_date: "2025-02-01",
      description: "Required every 6 months during OPT period",
      category: "employment",
      priority: "medium"
    },
    {
      title: "Health Insurance Renewal",
      due_date: "2025-03-10",
      description: "Current policy expires on this date",
      category: "personal",
      priority: "medium"
    }
  ];
  
  // Use actual deadlines if available, otherwise fallback to sample deadlines
  const displayDeadlines = deadlines.length > 0 ? deadlines.slice(0, 3) : defaultDeadlines;

  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 30; // Default fallback
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all border border-gray-100">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-white to-nexed-50">
        <div className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-nexed-600" />
          <CardTitle className="text-lg font-medium text-nexed-800">
            Compliance Center
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="tasks" className="text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="deadlines" className="text-sm">Deadlines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="mt-0">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{complianceProgress}% complete</span>
                <span className="text-nexed-600 font-medium">{tasksCount.completed} of {tasksCount.total} tasks</span>
              </div>
              <Progress 
                value={complianceProgress} 
                className="h-2 bg-gray-100" 
                indicatorClassName={`${complianceProgress < 30 ? 'bg-red-500' : complianceProgress < 70 ? 'bg-amber-500' : 'bg-green-500'}`}
              />
            </div>
            
            <div className="space-y-2">
              {sampleTasks.map((task, idx) => (
                <div 
                  key={idx} 
                  className="border border-gray-100 rounded-lg p-3 hover:border-nexed-200 hover:bg-nexed-50/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform ${
                        task.priority === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      }`}>
                        <FileCheck size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.name}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <Calendar size={12} className="mr-1" />
                          Due {task.dueDate}
                          <Badge 
                            className="ml-2 text-[10px] h-4 px-1" 
                            variant={task.priority === "high" ? "destructive" : "outline"}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs border-nexed-200 text-nexed-700 hover:bg-nexed-50"
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="deadlines" className="mt-0">
            <div className="grid grid-cols-1 gap-2">
              {displayDeadlines.map((deadline, index) => {
                const dueDate = new Date(deadline.due_date);
                const isValidDate = !isNaN(dueDate.getTime());
                const daysRemaining = getDaysRemaining(deadline.due_date);
                const isUrgent = daysRemaining <= 7;
                
                return (
                  <div 
                    key={index} 
                    className="border border-gray-100 rounded-lg p-3 hover:border-nexed-200 hover:bg-nexed-50/30 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${
                            deadline.category === "immigration" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : 
                            deadline.category === "employment" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : 
                            "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          }`}>
                            {deadline.category}
                          </Badge>
                          <Badge className={`text-xs flex items-center gap-1 ${
                            isUrgent ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}>
                            {isUrgent && <AlertTriangle size={10} />}
                            <Clock size={10} className="mr-0.5" />
                            {daysRemaining > 0 
                              ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left` 
                              : "Due today"}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-nexed-800">{deadline.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{deadline.description}</p>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center ml-2 flex-shrink-0">
                        <CalendarIcon size={12} className="mr-1" />
                        {isValidDate ? format(dueDate, 'MMM d, yyyy') : 'TBD'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
        
        <Button asChild variant="default" size="sm" className="w-full mt-4 bg-nexed-600 hover:bg-nexed-700">
          <div className="flex items-center justify-center gap-2 cursor-not-allowed opacity-50">
            <CheckCircle size={16} />
            <span>More Compliance Features Coming Soon</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComplianceDashboard;
