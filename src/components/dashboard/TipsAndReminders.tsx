
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TipsAndRemindersProps {
  visaType?: string;
}

const TipsAndReminders: React.FC<TipsAndRemindersProps> = ({ visaType }) => {
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
    <Card className="h-full">
      <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-nexed-800 flex items-center">
          <Lightbulb className="mr-2 h-4 w-4 text-nexed-600" />
          Tips & Guides
        </CardTitle>
        <Button asChild variant="ghost" size="icon" className="h-6 w-6">
          <Link to="/app/assistant">
            <ExternalLink size={14} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 py-2 space-y-1.5">
          {tips.map((tip, index) => (
            <div 
              key={index} 
              className="flex items-center p-2 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
            >
              <div className="h-5 w-5 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                <Lightbulb size={12} />
              </div>
              <p className="text-xs">{tip}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-br from-nexed-50 to-blue-50 p-3 mx-4 mb-3 mt-2 rounded-md border border-nexed-100">
          <h3 className="font-medium text-xs flex items-center text-nexed-800">
            <span className="text-nexed-600 mr-1.5">💡</span> Did you know?
          </h3>
          <p className="text-xs text-gray-700 mt-1">
            Students on F-1 visas can work on-campus for up to 20 hours per week during the academic year
            and full-time during breaks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TipsAndReminders;
