
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { EmploymentProfileSection } from "@/components/profile/EmploymentProfileSection";
import { VisaStatusSection } from "@/components/profile/VisaStatusSection";
import { AcademicInfoSection } from "@/components/profile/AcademicInfoSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { Users, Briefcase, GraduationCap, FileCheck } from "lucide-react";

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  
  // Format date safely with a fallback
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "Not specified";
    try {
      // Handle both string and Date inputs
      if (typeof date === 'string') {
        return format(parseISO(date), "MMM d, yyyy");
      } else {
        return format(date, "MMM d, yyyy");
      }
    } catch (e) {
      return "Invalid date";
    }
  };

  const getRequiredDocuments = () => {
    const docs = ["Valid Passport", "Visa Document"];

    if (currentUser?.visaType === "F1") {
      docs.push("I-20 Form", "SEVIS Fee Receipt", "I-94 Arrival Record");
    } else if (currentUser?.visaType === "J1") {
      docs.push("DS-2019 Form", "SEVIS Fee Receipt", "I-94 Arrival Record", "Health Insurance Documentation");
    } else if (currentUser?.visaType === "H1B") {
      docs.push("I-797 Approval Notice", "Labor Condition Application", "Employment Verification Letter");
    }

    return docs;
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal, visa, academic, and employment information
        </p>
      </header>
      
      <div className="space-y-6">
        <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Personal</span>
            </TabsTrigger>
            <TabsTrigger value="visa" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span>Visa</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Academic</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Employment</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ProfileEditor />
              </div>
              
              <div className="space-y-6">
                {/* Document Checklist Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Document Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Based on your visa type, ensure you have the following documents:
                    </p>
                    <ul className="space-y-2">
                      {getRequiredDocuments().map((doc, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-nexed-600 mr-2"></div>
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Visa Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Visa Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Current Status:</span>
                        <p className="font-medium">{currentUser?.visaType || "Not specified"}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Passport Expiry:</span>
                        <p className="font-medium">{formatDate(currentUser?.passportExpiryDate)}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Visa Expiry:</span>
                        <p className="font-medium">{formatDate(currentUser?.visa_expiry_date)}</p>
                      </div>
                      
                      {currentUser?.visaType === "F1" && (
                        <div className="p-3 bg-amber-50 rounded-md">
                          <p className="text-amber-800 text-sm">Remember to maintain full-time enrollment</p>
                        </div>
                      )}
                      
                      {currentUser?.visaType === "J1" && (
                        <div className="p-3 bg-amber-50 rounded-md">
                          <p className="text-amber-800 text-sm">Health insurance is mandatory</p>
                        </div>
                      )}
                      
                      {currentUser?.visaType === "H1B" && (
                        <div className="p-3 bg-amber-50 rounded-md">
                          <p className="text-amber-800 text-sm">Employment limited to sponsoring employer</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="visa">
            <VisaStatusSection />
          </TabsContent>
          
          <TabsContent value="academic">
            <AcademicInfoSection />
          </TabsContent>
          
          <TabsContent value="employment">
            <EmploymentProfileSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
