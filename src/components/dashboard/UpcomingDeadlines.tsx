
import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
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
    },
    {
      title: "I-20 Extension Application",
      due_date: "2025-04-05",
      description: "Current I-20 expires in 60 days",
      category: "immigration",
      priority: "high"
    }
  ];
  
  // Use actual deadlines if available, otherwise fallback to sample deadlines
  const displayDeadlines = deadlines.length > 0 ? deadlines : defaultDeadlines;

  return (
    <Card className="nexed-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl">
          <Calendar className="mr-2 h-5 w-5 text-nexed-600" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayDeadlines.map((deadline, index) => {
            const dueDate = new Date(deadline.due_date);
            const isValidDate = !isNaN(dueDate.getTime());
            
            return (
              <div key={index} className="flex border-b pb-3 last:border-0 last:pb-0">
                <div className="h-12 w-12 flex-shrink-0 flex flex-col items-center justify-center rounded-md bg-nexed-50 text-nexed-600 mr-4">
                  <span className="text-xs font-semibold">{isValidDate ? format(dueDate, 'MMM') : 'TBD'}</span>
                  <span className="text-lg font-bold">{isValidDate ? format(dueDate, 'd') : '--'}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      deadline.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {deadline.priority === "high" ? "High Priority" : "Medium Priority"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{deadline.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link to="/app/compliance">View All Deadlines</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
