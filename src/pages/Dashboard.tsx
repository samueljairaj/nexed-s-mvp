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

  // Check if we should show the onboarding checklist
  useEffect(() => {
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
        <Card className="bg-white shadow-sm overflow-hidden">
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
        <Card className="bg-white shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">Compliance Status</span>
              <div className="flex items-center mb-2">
                <span className="font-bold text-xl text-gray-800">{complianceProgress}%</span>
                <span className="ml-2 text-sm text-gray-600">
                  ({tasksCount.completed}/{tasksCount.total} tasks)
                </span>
              </div>
              <Progress value={complianceProgress} className="h-2 w-full bg-gray-200" />
            </div>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="bg-white shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">Documents</span>
              <div className="flex items-center mb-2">
                <span className="font-bold text-xl text-gray-800">{documentsCount.uploaded}/{documentsCount.total}</span>
                <span className="ml-2 text-sm text-gray-600">uploaded</span>
              </div>
              <Progress 
                value={documentsCount.total > 0 ? (documentsCount.uploaded / documentsCount.total) * 100 : 0} 
                className="h-2 w-full bg-gray-200" 
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
