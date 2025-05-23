
import React from "react";
import { Link } from "react-router-dom";
import { Upload, FileCheck, FolderArchive, MessageCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickLinksCard: React.FC = () => {
  const links = [
    { title: "Upload Documents", icon: <Upload size={16} />, to: "/app/documents", color: "bg-blue-50 text-blue-600" },
    { title: "Compliance Tasks", icon: <FileCheck size={16} />, to: "/app/compliance", color: "bg-green-50 text-green-600" },
    { title: "Document Vault", icon: <FolderArchive size={16} />, to: "/app/documents", color: "bg-amber-50 text-amber-600" },
    { title: "Ask Assistant", icon: <MessageCircle size={16} />, to: "/app/assistant", color: "bg-purple-50 text-purple-600" }
  ];
  
  const externalLinks = [
    { title: "SEVP Portal", description: "Student Exchange Portal" },
    { title: "USCIS Website", description: "Immigration Services" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-0 pt-4 px-4">
        <CardTitle className="text-base font-medium text-nexed-800">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-2 px-4 py-2">
          {links.map((link, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className="h-auto py-2 flex-col items-center justify-center text-center hover:bg-nexed-50 hover:border-nexed-200"
            >
              <Link to={link.to}>
                <span className={`h-7 w-7 rounded-md ${link.color} flex items-center justify-center mb-1.5`}>
                  {link.icon}
                </span>
                <span className="text-xs font-medium">{link.title}</span>
              </Link>
            </Button>
          ))}
        </div>
        
        <div className="px-4 pb-3 pt-1">
          <h3 className="text-xs font-medium mb-1.5 text-gray-700">External Resources</h3>
          <div className="space-y-1.5">
            {externalLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <p className="text-xs font-medium">{link.title}</p>
                  <p className="text-xs text-gray-500">{link.description}</p>
                </div>
                <ExternalLink size={12} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksCard;
