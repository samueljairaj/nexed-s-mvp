
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  action: string;
  item: string;
  date: string;
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
              date: formatActivityDate(doc.created_at)
            });
          });
        }
        
        // Add completed tasks to activities
        if (tasks?.length) {
          tasks.forEach(task => {
            activities.push({
              action: "Completed task",
              item: task.title,
              date: formatActivityDate(task.updated_at)
            });
          });
        }
        
        // If we have less than 4 activities, add sample activities
        if (activities.length < 4) {
          const sampleActivities = [
            {
              action: "Asked assistant",
              item: "How do I apply for OPT?",
              date: "May 5, 2025"
            },
            {
              action: "Marked as done",
              item: "Health Insurance Verification",
              date: "May 3, 2025"
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
        return format(date, "MMM d, yyyy");
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
      date: "Today, 2:34 PM"
    },
    {
      action: "Completed task",
      item: "Update Local Address",
      date: "Yesterday, 11:15 AM"
    },
    {
      action: "Asked assistant",
      item: "How do I apply for OPT?",
      date: "May 5, 2025"
    },
    {
      action: "Marked as done",
      item: "Health Insurance Verification",
      date: "May 3, 2025"
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <Card className="nexed-card">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <div key={index} className="flex items-start pb-3 border-b last:border-0 last:pb-0">
              <div className="h-8 w-8 rounded-full bg-nexed-100 flex items-center justify-center text-nexed-600 mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.item}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
