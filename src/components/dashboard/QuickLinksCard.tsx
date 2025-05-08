
import React from "react";
import { Link } from "react-router-dom";
import { Upload, FileCheck, FolderArchive, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickLinksCard: React.FC = () => {
  const links = [
    { title: "Upload New Document", icon: <Upload size={16} />, to: "/app/documents", color: "bg-blue-50 text-blue-600" },
    { title: "Complete Tasks", icon: <FileCheck size={16} />, to: "/app/compliance", color: "bg-green-50 text-green-600" },
    { title: "Browse Documents", icon: <FolderArchive size={16} />, to: "/app/documents", color: "bg-amber-50 text-amber-600" },
    { title: "Ask Assistant", icon: <MessageCircle size={16} />, to: "/app/assistant", color: "bg-purple-50 text-purple-600" }
  ];

  return (
    <Card className="nexed-card">
      <CardHeader>
        <CardTitle className="text-xl">Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.map((link, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <Link to={link.to} className="flex items-center">
                <span className={`w-8 h-8 mr-3 rounded-md ${link.color} flex items-center justify-center`}>
                  {link.icon}
                </span>
                <span>{link.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksCard;
