import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle2, Upload, MessageSquare, ArrowRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  // Generate avatar initials from activity action
  const getInitials = (action: string): string => {
    return action.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-nexed-800 flex items-center">
          <History className="mr-2 h-5 w-5 text-nexed-600" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {displayActivities.map((activity, index) => (
            <div 
              key={index} 
              className="flex items-start group hover:bg-gray-50 p-2 rounded-md transition-colors"
            >
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-nexed-100 text-nexed-600 text-xs">
                  {getInitials(activity.action)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm text-gray-900 truncate">{activity.action}</p>
                  <span className="text-xs text-gray-500 ml-1 shrink-0">{activity.date}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">{activity.item}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Button asChild variant="ghost" size="sm" className="w-full mt-3 text-xs text-nexed-600 hover:text-nexed-800">
          <Link to="/app/profile" className="flex items-center justify-center gap-1">
            View all activity
            <ArrowRight size={14} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
