
import React from "react";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VisaStatusCardProps {
  currentUser: any;
}

const VisaStatusCard: React.FC<VisaStatusCardProps> = ({ currentUser }) => {
  // Get visa details based on visa type
  let status = "Active";
  
  // Use visa_expiry_date if available, otherwise fallback to passport expiry
  let visaExpiryDate = currentUser?.visa_expiry_date;
  let passportExpiryDate = currentUser?.passportExpiryDate;
  
  let validUntil = visaExpiryDate 
    ? format(new Date(visaExpiryDate), "MMM d, yyyy")
    : passportExpiryDate 
    ? format(new Date(passportExpiryDate), "MMM d, yyyy") + " (passport)"
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
            <Clock size={12} className="inline mr-1" /> Visa valid until {validUntil}
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
              <span>Passport {passportExpiryDate ? "valid until " + format(new Date(passportExpiryDate), "MMM d, yyyy") : "information needed"}</span>
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

export default VisaStatusCard;
