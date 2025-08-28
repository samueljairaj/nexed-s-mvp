
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, FilePlus, Users } from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  visaType: string;
  complianceRate: number;
  documentsUploaded: number;
  documentsRequired: number;
  tasksCompleted: number;
  tasksTotal: number;
  riskLevel: "low" | "medium" | "high";
}

const DSODashboard = () => {
  const { currentUser, isDSO } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [universityStats, setUniversityStats] = useState({
    studentCount: 0,
    documentsCompliance: 0,
    tasksCompliance: 0,
    highRiskCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDSOData = async () => {
      if (!currentUser?.id || !isDSO) return;

      setIsLoading(true);
      try {
        // Fetch students from the same university
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, name, visa_type')
          .eq('university_id', currentUser.universityId)
          .eq('role', 'student');

        if (studentsError) throw studentsError;

        // Map and enrich student data with compliance information
        const enrichedStudents: StudentData[] = [];
        let totalDocumentsCompliance = 0;
        let totalTasksCompliance = 0;
        let highRiskStudents = 0;

        if (studentsData) {
          for (const student of studentsData) {
            // Get document counts
            const { data: documents, error: documentsError } = await supabase
              .from('documents')
              .select('*')
              .eq('user_id', student.id);

            if (documentsError) throw documentsError;

            const requiredDocs = 10; // Replace with dynamic calculation based on visa type
            const documentsUploaded = documents?.length || 0;

            // Get task completion rate
            const { data: tasks, error: tasksError } = await supabase
              .from('compliance_tasks')
              .select('*')
              .eq('user_id', student.id);

            if (tasksError) throw tasksError;

            const tasksTotal = tasks?.length || 0;
            const tasksCompleted = tasks?.filter(task => task.is_completed)?.length || 0;

            // Calculate compliance rate
            const docsComplianceRate = requiredDocs ? (documentsUploaded / requiredDocs) * 100 : 0;
            const tasksComplianceRate = tasksTotal ? (tasksCompleted / tasksTotal) * 100 : 0;
            const overallCompliance = (docsComplianceRate + tasksComplianceRate) / 2;

            // Determine risk level
            let riskLevel: "low" | "medium" | "high" = "low";
            if (overallCompliance < 40) {
              riskLevel = "high";
              highRiskStudents++;
            } else if (overallCompliance < 70) {
              riskLevel = "medium";
            }

            enrichedStudents.push({
              id: student.id,
              name: student.name || "Unknown Student",
              visaType: student.visa_type || "Unknown",
              complianceRate: Math.round(overallCompliance),
              documentsUploaded,
              documentsRequired: requiredDocs,
              tasksCompleted,
              tasksTotal,
              riskLevel
            });

            totalDocumentsCompliance += docsComplianceRate;
            totalTasksCompliance += tasksComplianceRate;
          }
        }

        setStudents(enrichedStudents);
        setUniversityStats({
          studentCount: enrichedStudents.length,
          documentsCompliance: Math.round(enrichedStudents.length ? totalDocumentsCompliance / enrichedStudents.length : 0),
          tasksCompliance: Math.round(enrichedStudents.length ? totalTasksCompliance / enrichedStudents.length : 0),
          highRiskCount: highRiskStudents
        });
      } catch (error) {
        console.error("Error fetching DSO dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDSOData();
  }, [currentUser, isDSO]);

  if (!isDSO) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-600">You do not have DSO access.</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">DSO Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor student compliance and visa statuses at {currentUser?.university || "your university"}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="mr-2 h-5 w-5 text-nexed-600" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{universityStats.studentCount}</p>
            <p className="text-sm text-gray-500">Total enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <FilePlus className="mr-2 h-5 w-5 text-nexed-600" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{universityStats.documentsCompliance}%</p>
            <Progress value={universityStats.documentsCompliance} className="h-2 mt-2" />
            <p className="text-sm text-gray-500 mt-1">Overall document compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Clock className="mr-2 h-5 w-5 text-nexed-600" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{universityStats.tasksCompliance}%</p>
            <Progress value={universityStats.tasksCompliance} className="h-2 mt-2" />
            <p className="text-sm text-gray-500 mt-1">Overall task completion</p>
          </CardContent>
        </Card>

        <Card className={universityStats.highRiskCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg font-medium flex items-center ${universityStats.highRiskCount > 0 ? "text-red-600" : ""}`}>
              <AlertTriangle className={`mr-2 h-5 w-5 ${universityStats.highRiskCount > 0 ? "text-red-600" : "text-amber-600"}`} />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${universityStats.highRiskCount > 0 ? "text-red-600" : ""}`}>
              {universityStats.highRiskCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">Students at high risk</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Student Compliance Status</CardTitle>
          <CardDescription>View and manage student visa compliance</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No students found in your university.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.visaType}</TableCell>
                    <TableCell>
                      {student.documentsUploaded}/{student.documentsRequired}
                    </TableCell>
                    <TableCell>
                      {student.tasksCompleted}/{student.tasksTotal}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={student.complianceRate} className="h-2 w-24" />
                        <span>{student.complianceRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium
                        ${student.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 
                          student.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DSODashboard;

