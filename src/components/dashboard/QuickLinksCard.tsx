
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
    <Card className="h-full hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-nexed-800">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          {links.map((link, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className="h-auto py-3 flex-col items-center justify-center text-center hover:bg-nexed-50 hover:border-nexed-200"
            >
              <Link to={link.to}>
                <span className={`h-8 w-8 rounded-md ${link.color} flex items-center justify-center mb-2`}>
                  {link.icon}
                </span>
                <span className="text-xs font-medium">{link.title}</span>
              </Link>
            </Button>
          ))}
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700">External Resources</h3>
          <div className="space-y-2">
            {externalLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-nexed-50 rounded-md hover:bg-nexed-100 transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium">{link.title}</p>
                  <p className="text-xs text-gray-500">{link.description}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksCard;
