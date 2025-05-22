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
    <div>
      {/* Onboarding Checklist Dialog */}
      <OnboardingChecklist 
        open={showChecklist} 
        onOpenChange={setShowChecklist} 
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {currentUser?.name || "Student"}</h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your visa status and compliance
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <VisaStatusCard />
        <ComplianceChecklist 
          complianceProgress={complianceProgress} 
          tasksCount={tasksCount}
        />
        <DocumentVault documentsCount={documentsCount} />
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

export default Dashboard;
