
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
  return (
    <Card className="nexed-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Document Vault</CardTitle>
        <CardDescription>Essential documents stored</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between text-sm">
          <span>{Math.round((documentsCount.uploaded / documentsCount.total) * 100)}% uploaded</span>
          <span className="text-nexed-600 font-medium">{documentsCount.uploaded} of {documentsCount.total} documents</span>
        </div>
        <Progress 
          value={(documentsCount.uploaded / documentsCount.total) * 100} 
          className="h-2" 
        />
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/app/documents" className="flex gap-2">
              <Upload size={16} /> Upload Documents
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVault;
