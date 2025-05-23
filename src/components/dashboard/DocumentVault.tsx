
import React from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DocumentVaultProps {
  documentsCount: {
    total: number;
    uploaded: number;
  };
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ documentsCount }) => {
  const uploadPercentage = Math.round((documentsCount.uploaded / documentsCount.total) * 100);
  
  // Sample document list for UI purposes
  const recentDocuments = [
    { name: "Passport Copy", type: "ID" },
    { name: "I-20 Form", type: "Visa" },
    { name: "Health Insurance", type: "Health" }
  ];
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium text-nexed-800">Document Vault</CardTitle>
          <CardDescription className="text-xs">Essential documents stored</CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" className="h-6 w-6">
          <Link to="/app/documents">
            <ArrowRight size={14} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="mb-2 flex justify-between text-xs">
          <span>{uploadPercentage}% uploaded</span>
          <span className="text-nexed-600 font-medium">{documentsCount.uploaded} of {documentsCount.total} documents</span>
        </div>
        <Progress value={uploadPercentage} className="h-1.5 mb-4" />
        
        <div className="space-y-1.5">
          {recentDocuments.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded-md">
              <div className="flex items-center">
                <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                  <FileText size={14} />
                </div>
                <div>
                  <p className="text-xs font-medium">{doc.name}</p>
                  <p className="text-[10px] text-gray-500">{doc.type}</p>
                </div>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                Verified
              </span>
            </div>
          ))}
        </div>
        
        <Button asChild variant="outline" size="sm" className="w-full group mt-3">
          <Link to="/app/documents" className="flex items-center justify-center gap-1.5 text-xs">
            <Upload size={12} className="group-hover:scale-110 transition-transform" /> 
            Upload Documents
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentVault;
