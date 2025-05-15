
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { format, parseISO } from "date-fns";

const Profile = () => {
  const { currentUser } = useAuth();
  
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

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProfileEditor /> {/* The user prop is now optional */}
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
    </div>
  );
};

export default Profile;
