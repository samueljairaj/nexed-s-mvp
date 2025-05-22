
import React from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
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
  
  return (
    <Card className="hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Document Vault</CardTitle>
        <CardDescription>Essential documents stored</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between text-sm">
          <span>{uploadPercentage}% uploaded</span>
          <span className="text-nexed-600 font-medium">{documentsCount.uploaded} of {documentsCount.total} documents</span>
        </div>
        <Progress 
          value={uploadPercentage} 
          className="h-2 mb-4"
        />
        <Button asChild variant="outline" size="sm" className="w-full group">
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
