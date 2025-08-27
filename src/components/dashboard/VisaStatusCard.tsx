
import React from "react";
import { useAuth } from "@/contexts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CalendarClock } from "lucide-react";

const VisaStatusCard = () => {
  const { currentUser } = useAuth();
  
  // Visa expiry date, safely formatted
  const visaExpiryDate = currentUser?.visa_expiry_date 
    ? formatDate(currentUser.visa_expiry_date)
    : "Not available";
    
  // Calculate days until expiry
  const daysUntilExpiry = currentUser?.visa_expiry_date 
    ? Math.floor((new Date(currentUser.visa_expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
    
  // Determine visa status
  const getVisaStatus = () => {
    if (!daysUntilExpiry) return "Unknown";
    if (daysUntilExpiry < 0) return "Expired";
    if (daysUntilExpiry < 60) return "Expiring Soon";
    return "Active";
  };
  
  // Get status color
  const getStatusColor = () => {
    const status = getVisaStatus();
    if (status === "Expired") return "bg-red-100 text-red-800";
    if (status === "Expiring Soon") return "bg-amber-100 text-amber-800";
    if (status === "Active") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };
  
  // Calculate progress for visa validity (reverse percentage - 100% new, 0% expired)
  const getExpiryProgress = () => {
    if (!currentUser?.visa_expiry_date || !currentUser?.usEntryDate) return 100;
    
    try {
      // Convert both dates to timestamps
      const entryDate = new Date(currentUser.usEntryDate).getTime();
      const expiryDate = new Date(currentUser.visa_expiry_date).getTime();
      const now = Date.now();
      
      // Calculate total visa duration and time elapsed
      const totalDuration = expiryDate - entryDate;
      const elapsed = now - entryDate;
      
      // Return remaining percentage (100% when new, 0% when expired)
      return Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100));
    } catch (error) {
      console.error("Error calculating visa expiry progress:", error);
      return 100;
    }
  };
  
  // Format US entry date
  const entryDate = currentUser?.usEntryDate 
    ? formatDate(currentUser.usEntryDate)
    : "Not available";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Visa Status</CardTitle>
        <CardDescription>
          {currentUser?.visaType || "Unknown"} Visa Information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <Badge className={getStatusColor()}>{getVisaStatus()}</Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Valid Until</div>
            <div className="font-medium flex items-center gap-1">
              <CalendarClock size={16} className="text-gray-500" />
              {visaExpiryDate}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm flex justify-between">
            <span>Validity Remaining</span>
            <span>{daysUntilExpiry !== null ? `${daysUntilExpiry} days` : "Unknown"}</span>
          </div>
          <Progress 
            value={getExpiryProgress()} 
            className="h-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
          <div>
            <span className="text-gray-500">Entry Date:</span>{" "}
            <span className="font-medium">{entryDate}</span>
          </div>
          <div>
            <span className="text-gray-500">University:</span>{" "}
            <span className="font-medium">{currentUser?.university || "Not provided"}</span>
          </div>
          {currentUser?.fieldOfStudy && (
            <div>
              <span className="text-gray-500">Field:</span>{" "}
              <span className="font-medium">{currentUser.fieldOfStudy}</span>
            </div>
          )}
          {currentUser?.isSTEM === true && (
            <div>
              <span className="text-gray-500">STEM:</span>{" "}
              <span className="font-medium">Yes</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisaStatusCard;
