
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileCheck, FolderArchive, MessageCircle, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [complianceProgress, setComplianceProgress] = useState(0);
  const [documentsCount, setDocumentsCount] = useState({ total: 0, uploaded: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [tasksCount, setTasksCount] = useState({ total: 0, completed: 0 });
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch documents count
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', currentUser?.id);
          
        if (documentsError) throw documentsError;
        
        // Fetch compliance tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('compliance_tasks')
          .select('*')
          .eq('user_id', currentUser?.id);
          
        if (tasksError) throw tasksError;
        
        // Calculate document stats
        if (documents) {
          const requiredDocs = documents.filter(doc => doc.is_required).length;
          setDocumentsCount({
            total: Math.max(requiredDocs, 12), // Ensure minimum of 12 for UI
            uploaded: documents.length
          });
        }
        
        // Calculate tasks stats
        if (tasks) {
          const completedTasks = tasks.filter(task => task.is_completed).length;
          setTasksCount({
            total: tasks.length || 20, // Ensure minimum of 20 for UI
            completed: completedTasks
          });
          
          // Calculate progress percentage
          const progressPercentage = tasks.length > 0 
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0;
          
          setComplianceProgress(progressPercentage);
          
          // Get upcoming deadlines (not completed tasks, sorted by due date)
          const upcomingDeadlines = tasks
            .filter(task => !task.is_completed && task.due_date)
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 4); // Get top 4 deadlines
            
          setDeadlines(upcomingDeadlines);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {currentUser?.name || "Student"}</h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your visa status and compliance
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <VisaStatusCard currentUser={currentUser} />
        <Card className="nexed-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Compliance Checklist</CardTitle>
            <CardDescription>Task completion progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between text-sm">
              <span>{complianceProgress}% complete</span>
              <span className="text-nexed-600 font-medium">{tasksCount.completed} of {tasksCount.total} tasks</span>
            </div>
            <Progress value={complianceProgress} className="h-2" />
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/app/compliance" className="flex gap-2">
                  <FileCheck size={16} /> View Tasks
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="nexed-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Document Vault</CardTitle>
            <CardDescription>Essential documents stored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between text-sm">
              <span>{Math.round((documentsCount.uploaded / documentsCount.total) * 100)}% uploaded</span>
              <span className="text-nexed-600 font-medium">{documentsCount.uploaded} of {documentsCount.total} documents</span>
            </div>
            <Progress 
              value={(documentsCount.uploaded / documentsCount.total) * 100} 
              className="h-2" 
            />
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/app/documents" className="flex gap-2">
                  <Upload size={16} /> Upload Documents
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
        <div>
          <QuickLinksCard />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivities currentUser={currentUser} />
        <TipsAndReminders visaType={currentUser?.visaType} />
      </div>
    </div>
  );
};

const VisaStatusCard = ({ currentUser }) => {
  // Get visa details based on visa type
  let status = "Active";
  let validUntil = currentUser?.passportExpiryDate 
    ? format(new Date(currentUser.passportExpiryDate), "MMM d, yyyy")
    : "Not specified";
  let statusColor = "text-green-600";
  let statusBgColor = "bg-green-100";
  
  // If there's no visa type, show warning status
  if (!currentUser?.visaType) {
    status = "Unknown";
    statusColor = "text-amber-600";
    statusBgColor = "bg-amber-100";
  }

  return (
    <Card className="nexed-card border-l-4 border-l-nexed-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Visa Status</CardTitle>
        <CardDescription>
          {currentUser?.visaType === "F1" && "F-1 Student Visa"}
          {currentUser?.visaType === "J1" && "J-1 Exchange Visitor Visa"}
          {currentUser?.visaType === "OPT" && "Optional Practical Training (OPT)"}
          {currentUser?.visaType === "H1B" && "H-1B Work Visa"}
          {(!currentUser?.visaType || currentUser?.visaType === "Other") && "Visa Information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBgColor} ${statusColor} mr-2`}>
            <CheckCircle2 size={12} className="mr-1" /> {status}
          </span>
          <span className="text-gray-600 text-sm">
            <Clock size={12} className="inline mr-1" /> Valid until {validUntil}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <ul className="space-y-1">
            <li className="flex items-start">
              <CheckCircle2 size={14} className="text-green-500 mr-2 mt-1" />
              <span>{currentUser?.visaType ? `${currentUser.visaType} visa status active` : "Visa information pending"}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 size={14} className="text-green-500 mr-2 mt-1" />
              <span>Passport {currentUser?.passportExpiryDate ? "valid until " + format(new Date(currentUser.passportExpiryDate), "MMM d, yyyy") : "information needed"}</span>
            </li>
            <li className="flex items-start">
              <AlertTriangle size={14} className="text-amber-500 mr-2 mt-1" />
              <span>{currentUser?.university ? `Enrolled at ${currentUser.university}` : "University information needed"}</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

const UpcomingDeadlines = ({ deadlines = [] }) => {
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

const QuickLinksCard = () => {
  const links = [
    { title: "Upload New Document", icon: <Upload size={16} />, to: "/app/documents", color: "bg-blue-50 text-blue-600" },
    { title: "Complete Tasks", icon: <FileCheck size={16} />, to: "/app/compliance", color: "bg-green-50 text-green-600" },
    { title: "Browse Documents", icon: <FolderArchive size={16} />, to: "/app/documents", color: "bg-amber-50 text-amber-600" },
    { title: "Ask Assistant", icon: <MessageCircle size={16} />, to: "/app/assistant", color: "bg-purple-50 text-purple-600" }
  ];

  return (
    <Card className="nexed-card">
      <CardHeader>
        <CardTitle className="text-xl">Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.map((link, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <Link to={link.to} className="flex items-center">
                <span className={`w-8 h-8 mr-3 rounded-md ${link.color} flex items-center justify-center`}>
                  {link.icon}
                </span>
                <span>{link.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivities = ({ currentUser }) => {
  const [activities, setActivities] = useState([]);
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
          
        const activities = [];
        
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
  const formatActivityDate = (dateString) => {
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

const TipsAndReminders = ({ visaType }) => {
  let tips = [
    "Always carry your I-20 and passport when traveling",
    "Update your address in SEVIS within 10 days of moving",
    "Maintain full-time enrollment (12+ credits per semester)",
    "Check passport expiration date regularly"
  ];

  if (visaType === "OPT") {
    tips = [
      "Report employment changes within 10 days to DSO",
      "Keep track of unemployment days (max 90 days)",
      "Ensure job is related to your field of study",
      "Apply for STEM extension 90 days before OPT expires (if eligible)"
    ];
  } else if (visaType === "H1B") {
    tips = [
      "Keep H1B approval notice accessible",
      "Notify USCIS of address changes",
      "Consult employer before international travel",
      "Start renewal process 6 months before expiration"
    ];
  }

  return (
    <Card className="nexed-card">
      <CardHeader>
        <CardTitle className="text-xl">Tips & Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-nexed-100 flex-shrink-0 flex items-center justify-center text-nexed-600 mr-3">
                <span className="text-xs">{index + 1}</span>
              </div>
              <span className="text-gray-700">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
