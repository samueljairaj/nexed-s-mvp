
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileCheck, FolderArchive, MessageCircle, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [complianceProgress, setComplianceProgress] = useState(0);
  const [documentsCount, setDocumentsCount] = useState({ total: 0, uploaded: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setComplianceProgress(65);
      setDocumentsCount({
        total: 12,
        uploaded: 8
      });
      setIsLoading(false);
    }, 1000);
  }, []);

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
        <VisaStatusCard visaType={currentUser?.visaType} />
        <Card className="nexed-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Compliance Checklist</CardTitle>
            <CardDescription>Task completion progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between text-sm">
              <span>{complianceProgress}% complete</span>
              <span className="text-nexed-600 font-medium">13 of 20 tasks</span>
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
          <UpcomingDeadlines />
        </div>
        <div>
          <QuickLinksCard />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivities />
        <TipsAndReminders visaType={currentUser?.visaType} />
      </div>
    </div>
  );
};

const VisaStatusCard = ({ visaType }: { visaType: string | null | undefined }) => {
  // Get visa details based on visa type
  let status = "Active";
  let validUntil = "May 15, 2026";
  let statusColor = "text-green-600";
  let statusBgColor = "bg-green-100";

  return (
    <Card className="nexed-card border-l-4 border-l-nexed-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Visa Status</CardTitle>
        <CardDescription>
          {visaType === "F1" && "F-1 Student Visa"}
          {visaType === "OPT" && "Optional Practical Training (OPT)"}
          {visaType === "H1B" && "H-1B Work Visa"}
          {(!visaType || visaType === "Other") && "Visa Information"}
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
              <span>I-20/DS-2019 current and valid</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 size={14} className="text-green-500 mr-2 mt-1" />
              <span>Passport valid for next 6+ months</span>
            </li>
            <li className="flex items-start">
              <AlertTriangle size={14} className="text-amber-500 mr-2 mt-1" />
              <span>SEVIS registration update needed</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

const UpcomingDeadlines = () => {
  const deadlines = [
    {
      title: "SEVIS Registration for Spring Semester",
      date: "January 15, 2025",
      description: "Verify your information in SEVIS is accurate",
      category: "immigration",
      priority: "high"
    },
    {
      title: "Submit OPT Progress Report",
      date: "February 1, 2025",
      description: "Required every 6 months during OPT period",
      category: "employment",
      priority: "medium"
    },
    {
      title: "Health Insurance Renewal",
      date: "March 10, 2025",
      description: "Current policy expires on this date",
      category: "personal",
      priority: "medium"
    },
    {
      title: "I-20 Extension Application",
      date: "April 5, 2025",
      description: "Current I-20 expires in 60 days",
      category: "immigration",
      priority: "high"
    }
  ];

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
          {deadlines.map((deadline, index) => (
            <div key={index} className="flex border-b pb-3 last:border-0 last:pb-0">
              <div className="h-12 w-12 flex-shrink-0 flex flex-col items-center justify-center rounded-md bg-nexed-50 text-nexed-600 mr-4">
                <span className="text-xs font-semibold">{deadline.date.split(" ")[0]}</span>
                <span className="text-lg font-bold">{deadline.date.split(" ")[1].replace(",", "")}</span>
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
          ))}
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

const RecentActivities = () => {
  const activities = [
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

  return (
    <Card className="nexed-card">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
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

const TipsAndReminders = ({ visaType }: { visaType: string | null | undefined }) => {
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
