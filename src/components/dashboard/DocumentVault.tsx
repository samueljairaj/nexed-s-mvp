
import React from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, ArrowRight, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

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
    { name: "Passport Copy", type: "ID", status: "Verified" },
    { name: "I-20 Form", type: "Visa", status: "Verified" },
    { name: "Health Insurance", type: "Health", status: "Pending" }
  ];
  
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium text-nexed-800">Document Vault</CardTitle>
          <CardDescription>Essential documents stored</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Search size={14} />
            <span>Search</span>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Link to="/app/documents">
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{uploadPercentage}% uploaded</span>
            <span className="text-nexed-600 font-medium">{documentsCount.uploaded} of {documentsCount.total}</span>
          </div>
          <Progress value={uploadPercentage} className="h-2" />
        </div>
        
        <Table>
          <TableBody>
            {recentDocuments.map((doc, idx) => (
              <TableRow key={idx} className="border-b hover:bg-gray-50">
                <TableCell className="py-3 pl-3 pr-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-nexed-100 flex items-center justify-center text-nexed-600 mr-3">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "Verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {doc.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/app/documents" className="flex items-center justify-center gap-2">
              <Search size={16} /> 
              Browse Documents
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="w-full">
            <Link to="/app/documents" className="flex items-center justify-center gap-2">
              <Upload size={16} /> 
              Upload New
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVault;
