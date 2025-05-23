
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle2, Upload, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Activity {
  action: string;
  item: string;
  date: string;
  icon?: React.ReactNode;
}

interface RecentActivitiesProps {
  currentUser: any;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ currentUser }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!currentUser?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch latest documents
        const { data: documents } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(2);
          
        // Fetch latest completed tasks
        const { data: tasks } = await supabase
          .from('compliance_tasks')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('is_completed', true)
          .order('updated_at', { ascending: false })
          .limit(2);
          
        const activities: Activity[] = [];
        
        // Add documents to activities
        if (documents?.length) {
          documents.forEach(doc => {
            activities.push({
              action: "Uploaded document",
              item: doc.title,
              date: formatActivityDate(doc.created_at),
              icon: <Upload size={16} className="text-blue-500" />
            });
          });
        }
        
        // Add completed tasks to activities
        if (tasks?.length) {
          tasks.forEach(task => {
            activities.push({
              action: "Completed task",
              item: task.title,
              date: formatActivityDate(task.updated_at),
              icon: <CheckCircle2 size={16} className="text-green-500" />
            });
          });
        }
        
        // If we have less than 4 activities, add sample activities
        if (activities.length < 4) {
          const sampleActivities = [
            {
              action: "Asked assistant",
              item: "How do I apply for OPT?",
              date: "2 days ago",
              icon: <MessageSquare size={16} className="text-purple-500" />
            },
            {
              action: "Completed task",
              item: "Health Insurance Verification",
              date: "3 days ago",
              icon: <CheckCircle2 size={16} className="text-green-500" />
            }
          ];
          
          // Add enough sample activities to have 4 total
          const samplesToAdd = Math.min(4 - activities.length, sampleActivities.length);
          activities.push(...sampleActivities.slice(0, samplesToAdd));
        }
        
        // Sort by date (most recent first) and limit to 4
        activities.sort((a, b) => {
          if (a.date === "Today") return -1;
          if (b.date === "Today") return 1;
          if (a.date === "Yesterday") return -1;
          if (b.date === "Yesterday") return 1;
          return 0; // Keep other dates in original order
        });
        
        setActivities(activities.slice(0, 4));
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [currentUser]);

  // Format activity date for display
  const formatActivityDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === now.toDateString()) {
        return "Today, " + format(date, "h:mm a");
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday, " + format(date, "h:mm a");
      } else {
        return format(date, "MMM d");
      }
    } catch (e) {
      return "Recent";
    }
  };

  // Default activities if none found
  const defaultActivities = [
    {
      action: "Uploaded document",
      item: "Passport Copy",
      date: "Today",
      icon: <Upload size={16} className="text-blue-500" />
    },
    {
      action: "Completed task",
      item: "Update Local Address",
      date: "Yesterday",
      icon: <CheckCircle2 size={16} className="text-green-500" />
    },
    {
      action: "Asked assistant",
      item: "How do I apply for OPT?",
      date: "2 days ago",
      icon: <MessageSquare size={16} className="text-purple-500" />
    },
    {
      action: "Completed task",
      item: "Health Insurance Verification",
      date: "3 days ago",
      icon: <CheckCircle2 size={16} className="text-green-500" />
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/app/profile">
            <ArrowRight size={16} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {displayActivities.map((activity, index) => (
          <div key={index} className="flex items-start py-3 border-b last:border-0 last:pb-0">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              {activity.icon || <Clock size={16} className="text-gray-500" />}
            </div>
            <div>
              <p className="font-medium text-gray-900">{activity.action}</p>
              <p className="text-sm text-gray-600">{activity.item}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
