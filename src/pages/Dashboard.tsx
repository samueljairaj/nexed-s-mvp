import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DocumentVault from "@/components/dashboard/DocumentVault";
import QuickLinksCard from "@/components/dashboard/QuickLinksCard";
import RecentActivities from "@/components/dashboard/RecentActivities";
import TipsAndReminders from "@/components/dashboard/TipsAndReminders";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, FileCheck, Upload } from "lucide-react";
import ComplianceDashboard from "@/components/dashboard/ComplianceDashboard";
import { toast } from "sonner";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [complianceProgress, setComplianceProgress] = useState(0);
  const [documentsCount, setDocumentsCount] = useState({
    total: 0,
    uploaded: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [tasksCount, setTasksCount] = useState({
    total: 0,
    completed: 0
  });
  const [deadlines, setDeadlines] = useState([]);
  const [showChecklist, setShowChecklist] = useState(false);

  console.log("Dashboard component rendered:", {
    currentUser: currentUser?.id,
    isLoading,
    location: location.pathname
  });

  // Check if we should show the onboarding checklist
  useEffect(() => {
    console.log("Dashboard: Checking for onboarding checklist");
    // Check for flag in localStorage
    const shouldShowChecklist = localStorage.getItem('show_onboarding_checklist') === 'true';

    // Also check if we're redirected from onboarding with state
    const fromOnboarding = location.state?.fromOnboarding === true;
    if (shouldShowChecklist || fromOnboarding) {
      console.log("Showing onboarding checklist");
      setShowChecklist(true);

      // Remove the flag so it doesn't show again on refresh
      localStorage.removeItem('show_onboarding_checklist');
    }
  }, [location]);

  useEffect(() => {
    console.log("Dashboard: Starting data fetch");
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch documents count
        const {
          data: documents,
          error: documentsError
        } = await supabase.from('documents').select('*').eq('user_id', currentUser?.id);
        if (documentsError) throw documentsError;

        // Fetch compliance tasks
        const {
          data: tasks,
          error: tasksError
        } = await supabase.from('compliance_tasks').select('*').eq('user_id', currentUser?.id);
        if (tasksError) throw tasksError;

        console.log("Dashboard: Data fetched successfully", {
          documentsCount: documents?.length,
          tasksCount: tasks?.length
        });

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
          const progressPercentage = tasks.length > 0 ? Math.round(completedTasks / tasks.length * 100) : 0;
          setComplianceProgress(progressPercentage);

          // Get upcoming deadlines (not completed tasks, sorted by due date)
          const upcomingDeadlines = tasks
            .filter(task => !task.is_completed && task.due_date)
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 4); // Get top 4 deadlines

          setDeadlines(upcomingDeadlines);
        }
      } catch (error) {
        console.error("Dashboard: Error fetching data:", error);
      } finally {
        console.log("Dashboard: Data fetch completed");
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchData();
    } else {
      console.log("Dashboard: No current user, skipping data fetch");
      setIsLoading(false);
    }
  }, [currentUser]);

  // Function to check for expiring documents
  useEffect(() => {
    const checkExpiringDocuments = async () => {
      if (!currentUser?.id) return;
      
      try {
        // Get current date
        const today = new Date();
        
        // Get date 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        // Format dates for database query
        const todayFormatted = today.toISOString().split('T')[0];
        const thirtyDaysFormatted = thirtyDaysFromNow.toISOString().split('T')[0];
        
        // Query documents that are expiring soon but notification not sent
        const { data: expiringDocuments, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('expiry_notification_sent', false)
          .gte('expiry_date', todayFormatted)
          .lte('expiry_date', thirtyDaysFormatted);
          
        if (error) throw error;
        
        // Show notification for expiring documents
        if (expiringDocuments && expiringDocuments.length > 0) {
          // Group by expiry date for better notification
          const byDate: Record<string, { count: number, titles: string[] }> = {};
          
          expiringDocuments.forEach(doc => {
            const date = new Date(doc.expiry_date).toLocaleDateString();
            if (!byDate[date]) {
              byDate[date] = { count: 0, titles: [] };
            }
            byDate[date].count++;
            if (byDate[date].titles.length < 3) { // Limit to 3 titles per date
              byDate[date].titles.push(doc.title);
            }
          });
          
          // Show notification for each date group
          Object.entries(byDate).forEach(([date, info]) => {
            toast.warning(
              `${info.count} document${info.count > 1 ? 's' : ''} expiring on ${date}`,
              {
                description: info.titles.join(', ') + 
                  (info.count > info.titles.length ? ` and ${info.count - info.titles.length} more...` : ''),
                action: {
                  label: "View",
                  onClick: () => window.location.href = '/app/documents'
                },
                duration: 10000
              }
            );
          });
          
          // Mark notifications as sent
          const docIds = expiringDocuments.map(doc => doc.id);
          await supabase
            .from('documents')
            .update({ expiry_notification_sent: true })
            .in('id', docIds);
        }
        
      } catch (error) {
        console.error("Error checking for expiring documents:", error);
      }
    };
    
    checkExpiringDocuments();
  }, [currentUser?.id]);

  if (isLoading) {
    console.log("Dashboard: Showing loading spinner");
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
      </div>
    );
  }

  console.log("Dashboard: Rendering main content");

  return (
    <div className="animate-fade-in space-y-6">
      {/* Onboarding Checklist Dialog */}
      <OnboardingChecklist open={showChecklist} onOpenChange={setShowChecklist} />

      <header className="page-header mb-6">
        <h1 className="page-title text-nexed-800">
          Welcome back, {currentUser?.name || "Student"}
        </h1>
        <p className="page-subtitle">
          Here's your visa compliance overview
        </p>
      </header>

      {/* Status Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Visa Status Card */}
        <Card className="bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">Visa Status</span>
              <div className="flex items-center">
                <span className="font-bold text-xl text-gray-800">
                  {currentUser?.visaType || "F1"} Student
                </span>
                <span className={`ml-2 status-badge ${currentUser?.visa_expiry_date && new Date(currentUser.visa_expiry_date) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) ? "status-badge-warning" : "status-badge-success"}`}>
                  {currentUser?.visa_expiry_date && new Date(currentUser.visa_expiry_date) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) ? "Expiring Soon" : "Active"}
                </span>
              </div>
              <span className="text-xs mt-2 text-gray-500">
                {currentUser?.visa_expiry_date ? `Expires: ${new Date(currentUser.visa_expiry_date).toLocaleDateString()}` : "No expiry date set"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status Card */}
        <Card className="bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">Compliance Status</span>
              <div className="flex items-center mb-2">
                <span className="font-bold text-xl text-gray-800">{complianceProgress}%</span>
                <span className="ml-2 text-sm text-gray-600">
                  ({tasksCount.completed}/{tasksCount.total} tasks)
                </span>
              </div>
              <Progress 
                value={complianceProgress} 
                className="h-2 w-full bg-gray-100" 
                indicatorClassName={`${complianceProgress < 30 ? 'bg-red-500' : complianceProgress < 70 ? 'bg-amber-500' : 'bg-green-500'}`} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">Documents</span>
              <div className="flex items-center mb-2">
                <span className="font-bold text-xl text-gray-800">{documentsCount.uploaded}/{documentsCount.total}</span>
                <span className="ml-2 text-sm text-gray-600">uploaded</span>
              </div>
              <Progress 
                value={documentsCount.total > 0 ? (documentsCount.uploaded / documentsCount.total) * 100 : 0} 
                className="h-2 w-full bg-gray-100" 
                indicatorClassName={`bg-gradient-to-r from-nexed-400 to-nexed-500`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Row 1: Combined Compliance Dashboard */}
      <div className="grid grid-cols-1 gap-5">
        <ComplianceDashboard 
          complianceProgress={complianceProgress} 
          tasksCount={tasksCount}
          deadlines={deadlines}
        />
      </div>

      {/* Main Content - Row 2: Document Vault & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Document Vault */}
        <div className="lg:col-span-2">
          <DocumentVault documentsCount={documentsCount} />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <RecentActivities currentUser={currentUser} />
        </div>
      </div>

      {/* Main Content - Row 3: Quick Links & Tips and Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Links Card */}
        <div className="lg:col-span-1">
          <QuickLinksCard />
        </div>

        {/* Tips and Reminders */}
        <div className="lg:col-span-2">
          <TipsAndReminders visaType={currentUser?.visaType} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
