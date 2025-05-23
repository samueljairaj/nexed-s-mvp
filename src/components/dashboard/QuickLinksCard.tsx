
import React from "react";
import { Link } from "react-router-dom";
import { Upload, FileCheck, FolderArchive, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickLinksCard: React.FC = () => {
  const links = [
    { title: "Upload Documents", icon: <Upload size={16} />, to: "/app/documents", color: "bg-blue-50 text-blue-600" },
    { title: "Compliance Tasks", icon: <FileCheck size={16} />, to: "/app/compliance", color: "bg-green-50 text-green-600" },
    { title: "Document Vault", icon: <FolderArchive size={16} />, to: "/app/documents", color: "bg-amber-50 text-amber-600" },
    { title: "Ask Assistant", icon: <MessageCircle size={16} />, to: "/app/assistant", color: "bg-purple-50 text-purple-600" }
  ];

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-nexed-800">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ul className="space-y-3">
          {links.map((link, index) => (
            <li key={index}>
              <Link 
                to={link.to} 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className={`h-8 w-8 shrink-0 rounded-md ${link.color} flex items-center justify-center mr-3`}>
                  {link.icon}
                </span>
                <span className="font-medium text-sm">{link.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default QuickLinksCard;
