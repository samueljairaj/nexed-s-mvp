
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, FileCheck, Bell, Search, Filter, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Mock data for the dashboard
const MOCK_STUDENTS = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@university.edu",
    visaType: "F1",
    status: "Active",
    compliance: 100,
    lastUpdated: "2025-04-28"
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@university.edu",
    visaType: "F1",
    status: "Active",
    compliance: 86,
    lastUpdated: "2025-04-25"
  },
  {
    id: "3",
    name: "Charlie Chen",
    email: "charlie@university.edu",
    visaType: "OPT",
    status: "Active",
    compliance: 92,
    lastUpdated: "2025-04-26"
  },
  {
    id: "4",
    name: "Diana Rodriguez",
    email: "diana@university.edu",
    visaType: "F1",
    status: "Active",
    compliance: 65,
    lastUpdated: "2025-04-20"
  },
  {
    id: "5",
    name: "Eduardo Gomez",
    email: "eduardo@university.edu",
    visaType: "CPT",
    status: "Warning",
    compliance: 54,
    lastUpdated: "2025-04-15"
  },
];

export default function DSODashboard() {
  const { currentUser, isLoading, isDSO } = useAuth();
  const navigate = useNavigate();
  const [universityName, setUniversityName] = useState<string>("");
  const [isShowingOnboarding, setIsShowingOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visaFilter, setVisaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState(MOCK_STUDENTS);

  // Get university information
  useEffect(() => {
    const getUniversityInfo = async () => {
      if (currentUser) {
        // Get university name from profile or dso_profiles
        setUniversityName(currentUser.university || "Your University");
      }
    };
    
    getUniversityInfo();
    
    // Check if this is first login after onboarding
    const checkOnboardingStatus = () => {
      const onboardingComplete = sessionStorage.getItem("onboardingJustCompleted");
      if (onboardingComplete) {
        setIsShowingOnboarding(true);
        // Clear the flag after showing the tour
        setTimeout(() => {
          sessionStorage.removeItem("onboardingJustCompleted");
          setIsShowingOnboarding(false);
        }, 2000);
      }
    };
    
    checkOnboardingStatus();
  }, [currentUser]);

  // Redirect non-DSO users
  useEffect(() => {
    if (!isLoading && !isDSO) {
      navigate("/app/dashboard");
    }
  }, [isDSO, isLoading, navigate]);

  // Filter students based on search and filters
  useEffect(() => {
    let filteredStudents = [...MOCK_STUDENTS];
    
    if (searchQuery) {
      filteredStudents = filteredStudents.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (visaFilter !== "all") {
      filteredStudents = filteredStudents.filter(student => 
        student.visaType === visaFilter
      );
    }
    
    if (statusFilter !== "all") {
      filteredStudents = filteredStudents.filter(student => 
        student.status === statusFilter
      );
    }
    
    setStudents(filteredStudents);
  }, [searchQuery, visaFilter, statusFilter]);

  // Calculate overall compliance
  const calculateOverallCompliance = () => {
    if (students.length === 0) return 0;
    return Math.round(
      students.reduce((acc, student) => acc + student.compliance, 0) / students.length
    );
  };
  
  // Calculate document stats
  const documentStats = {
    verified: 45,
    pending: 18,
    expired: 7,
    missing: 12
  };
  
  // If still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            {universityName}
          </h1>
          <p className="text-muted-foreground">DSO Dashboard</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          
          <Button size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">
                {calculateOverallCompliance()}%
              </div>
              <Progress 
                value={calculateOverallCompliance()} 
                className="h-2 w-[60%]" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {students.length}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Active Students</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Document Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Verified: {documentStats.verified}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span>Pending: {documentStats.pending}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span>Expired: {documentStats.expired}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                <span>Missing: {documentStats.missing}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Student Management */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            View, filter and manage all students at your university
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filters:</span>
              </div>
              
              <Select value={visaFilter} onValueChange={setVisaFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Visa Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="F1">F1</SelectItem>
                  <SelectItem value="OPT">OPT</SelectItem>
                  <SelectItem value="CPT">CPT</SelectItem>
                  <SelectItem value="H1B">H1B</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Student Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.visaType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`h-2 w-2 rounded-full ${
                            student.status === "Active" ? "bg-green-500" : 
                            student.status === "Warning" ? "bg-amber-500" : "bg-red-500"
                          }`} 
                        />
                        {student.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={student.compliance} 
                          className="h-2 w-[60px]"
                        />
                        <span className="text-sm">{student.compliance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.lastUpdated}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <FileCheck className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No students found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Tour Overlay */}
      {isShowingOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Welcome to Your DSO Dashboard!</CardTitle>
              <CardDescription>
                You've successfully completed the onboarding process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Here you can manage all your international students, verify documents, 
                and ensure compliance with visa regulations.
              </p>
              <p>
                Explore the features and functionalities to get the most out of the neXed platform.
              </p>
            </CardContent>
            <div className="p-4 flex justify-end">
              <Button onClick={() => setIsShowingOnboarding(false)}>
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
