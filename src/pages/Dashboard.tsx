
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import VisaStatusCard from "@/components/dashboard/VisaStatusCard";
import ComplianceChecklist from "@/components/dashboard/ComplianceChecklist";
import DocumentVault from "@/components/dashboard/DocumentVault";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import QuickLinksCard from "@/components/dashboard/QuickLinksCard";
import RecentActivities from "@/components/dashboard/RecentActivities";
import TipsAndReminders from "@/components/dashboard/TipsAndReminders";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [complianceProgress, setComplianceProgress] = useState(0);
  const [documentsCount, setDocumentsCount] = useState({ total: 0, uploaded: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [tasksCount, setTasksCount] = useState({ total: 0, completed: 0 });
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
    <div className="animate-fade-in space-y-5">
      {/* Onboarding Checklist Dialog */}
      <OnboardingChecklist 
        open={showChecklist} 
        onOpenChange={setShowChecklist} 
      />

      <header className="page-header mb-4">
        <h1 className="page-title text-nexed-800">
          Welcome back, {currentUser?.name || "Student"}
        </h1>
        <p className="page-subtitle text-sm">
          Here's your visa compliance overview
        </p>
      </header>

      {/* Status Summary Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Visa Status</span>
            <div className="flex items-center mt-1">
              <span className="font-bold text-lg">
                {currentUser?.visaType || "F1"} Student
              </span>
              <span className={`ml-2 status-badge ${
                currentUser?.visa_expiry_date && new Date(currentUser.visa_expiry_date) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                  ? "status-badge-warning"
                  : "status-badge-success"
              }`}>
                {currentUser?.visa_expiry_date && new Date(currentUser.visa_expiry_date) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                  ? "Expiring Soon"
                  : "Active"
                }
              </span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Compliance Status</span>
            <div className="flex items-center mt-1 gap-3">
              <span className="font-bold text-lg">{complianceProgress}%</span>
              <div className="flex-1">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-nexed-500 rounded-full" 
                    style={{ width: `${complianceProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Documents</span>
            <div className="mt-1">
              <span className="font-bold text-lg">{documentsCount.uploaded}/{documentsCount.total}</span>
              <span className="ml-1 text-gray-600 text-sm">uploaded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Checklist Card */}
        <div className="lg:col-span-2 h-full">
          <ComplianceChecklist 
            complianceProgress={complianceProgress} 
            tasksCount={tasksCount}
          />
        </div>

        {/* Document Vault */}
        <div className="lg:col-span-2 h-full">
          <DocumentVault documentsCount={documentsCount} />
        </div>

        {/* Quick Links Card */}
        <div className="lg:col-span-1 md:row-span-2 h-full">
          <QuickLinksCard />
        </div>

        {/* Upcoming Deadlines */}
        <div className="lg:col-span-3 h-full">
          <UpcomingDeadlines deadlines={deadlines} />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 h-full">
          <RecentActivities currentUser={currentUser} />
        </div>

        {/* Tips and Reminders */}
        <div className="lg:col-span-2 h-full">
          <TipsAndReminders visaType={currentUser?.visaType} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
