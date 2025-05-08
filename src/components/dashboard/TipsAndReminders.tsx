
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default TipsAndReminders;
