
import React from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, ArrowRight, Clock, AlertTriangle, 
  FileCheck, CheckCircle, Calendar as CalendarIcon 
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
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <FileCheck className="mr-2 h-5 w-5 text-nexed-600" />
          <CardTitle className="text-lg font-medium text-nexed-800">
            Compliance Center
          </CardTitle>
        </div>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/app/compliance">
            <ArrowRight size={16} />
          </Link>
        </Button>
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
          </TabsContent>
          
          <TabsContent value="deadlines" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {displayDeadlines.map((deadline, index) => {
                const dueDate = new Date(deadline.due_date);
                const isValidDate = !isNaN(dueDate.getTime());
                const daysRemaining = getDaysRemaining(deadline.due_date);
                const isUrgent = daysRemaining <= 7;
                
                return (
                  <div key={index} className="bg-white border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs rounded-full px-2 py-0.5 ${
                        deadline.category === "immigration" ? "bg-blue-100 text-blue-700" : 
                        deadline.category === "employment" ? "bg-purple-100 text-purple-700" : 
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {deadline.category}
                      </span>
                      <span className={`text-xs rounded-full px-2 py-0.5 flex items-center ${
                        isUrgent ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {isUrgent && <AlertTriangle size={12} className="mr-1" />}
                        <Clock size={12} className="mr-1" />
                        {daysRemaining > 0 
                          ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left` 
                          : "Due today"}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{deadline.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{deadline.description}</p>
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <CalendarIcon size={12} className="mr-1" />
                      Due: {isValidDate ? format(dueDate, 'MMM d, yyyy') : 'TBD'}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
        
        <Button asChild variant="default" size="sm" className="w-full mt-4">
          <Link to="/app/compliance" className="flex items-center justify-center gap-1">
            <CheckCircle size={16} />
            View Full Compliance Hub
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComplianceDashboard;
