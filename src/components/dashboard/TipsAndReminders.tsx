
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TipsAndRemindersProps {
  visaType?: string;
}

const TipsAndReminders: React.FC<TipsAndRemindersProps> = ({
  visaType
}) => {
  const [openTip, setOpenTip] = useState<number | null>(null);

  let tips = ["Always carry your I-20 and passport when traveling", "Update your address in SEVIS within 10 days of moving", "Maintain full-time enrollment (12+ credits per semester)", "Check passport expiration date regularly"];
  
  if (visaType === "OPT") {
    tips = ["Report employment changes within 10 days to DSO", "Keep track of unemployment days (max 90 days)", "Ensure job is related to your field of study", "Apply for STEM extension 90 days before OPT expires (if eligible)"];
  } else if (visaType === "H1B") {
    tips = ["Keep H1B approval notice accessible", "Notify USCIS of address changes", "Consult employer before international travel", "Start renewal process 6 months before expiration"];
  }
  
  const toggleTip = (index: number) => {
    setOpenTip(openTip === index ? null : index);
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-nexed-800 flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-nexed-600" />
          Tips & Guides
        </CardTitle>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/app/assistant">
            <ExternalLink size={16} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {tips.map((tip, index) => (
          <Collapsible key={index} open={openTip === index} onOpenChange={() => toggleTip(index)}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-2 bg-nexed-50 rounded-lg hover:bg-nexed-100 cursor-pointer transition-colors">
                <div className="flex items-center">
                  <div className="h-7 w-7 flex-shrink-0 rounded-md bg-nexed-100 flex items-center justify-center text-nexed-600 mr-3">
                    <Lightbulb size={16} />
                  </div>
                  <p className="text-sm font-medium">{tip.split(" ").slice(0, 4).join(" ")}...</p>
                </div>
                {openTip === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 py-2 text-sm text-gray-600 ml-10">
              {tip}
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        <div className="bg-gradient-to-br from-nexed-50 to-blue-50 p-3 rounded-lg border border-nexed-100 mt-3">
          <h3 className="font-medium text-sm flex items-center text-nexed-800">
            <span className="text-nexed-600 mr-2">💡</span> Did you know?
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
