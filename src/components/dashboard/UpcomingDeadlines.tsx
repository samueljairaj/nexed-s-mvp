
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Deadline {
  title: string;
  due_date: string;
  description: string;
  category: string;
  priority: string;
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deadlines = [] }) => {
  // If no deadlines passed in, use default sample deadlines
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
    <Card className="h-full hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-nexed-600" />
          <CardTitle className="text-lg font-medium text-nexed-800">
            Upcoming Deadlines
          </CardTitle>
        </div>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/app/compliance">
            <ArrowRight size={16} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayDeadlines.map((deadline, index) => {
            const dueDate = new Date(deadline.due_date);
            const isValidDate = !isNaN(dueDate.getTime());
            const daysRemaining = getDaysRemaining(deadline.due_date);
            const isUrgent = daysRemaining <= 7;
            
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      deadline.category === "immigration" ? "bg-blue-100 text-blue-700" : 
                      deadline.category === "employment" ? "bg-purple-100 text-purple-700" : 
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {deadline.category}
                    </span>
                    <span className={`text-xs rounded-full px-2 py-1 flex items-center ${
                      isUrgent ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {isUrgent && <AlertTriangle size={12} className="mr-1" />}
                      <Clock size={12} className="mr-1" />
                      {daysRemaining > 0 
                        ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left` 
                        : "Due today"}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{deadline.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{deadline.description}</p>
                  <div className="text-sm text-gray-500 mt-auto">
                    Due: {isValidDate ? format(dueDate, 'MMM d, yyyy') : 'TBD'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button asChild variant="outline" size="sm" className="w-full mt-4">
          <Link to="/app/compliance">View All Deadlines</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
