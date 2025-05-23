
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
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">Document Vault</CardTitle>
          <CardDescription>Essential documents stored</CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to="/app/documents">
            <ArrowRight size={16} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between text-sm">
          <span>{uploadPercentage}% uploaded</span>
          <span className="text-nexed-600 font-medium">{documentsCount.uploaded} of {documentsCount.total} documents</span>
        </div>
        <Progress value={uploadPercentage} className="h-2 mb-6" />
        
        <div className="space-y-3">
          {recentDocuments.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-nexed-100 flex items-center justify-center text-nexed-600 mr-3">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type}</p>
                </div>
              </div>
              <span className="text-xs bg-nexed-100 text-nexed-600 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
          ))}
        </div>
        
        <Button asChild variant="outline" size="sm" className="w-full group mt-4">
          <Link to="/app/documents" className="flex items-center justify-center gap-2">
            <Upload size={16} className="group-hover:scale-110 transition-transform" /> 
            Upload Documents
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentVault;
