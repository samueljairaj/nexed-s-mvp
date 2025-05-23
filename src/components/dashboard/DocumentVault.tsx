
import React from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, ArrowRight, Search, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { generateMockDocuments } from "@/utils/mockDocuments";

interface DocumentVaultProps {
  documentsCount: {
    total: number;
    uploaded: number;
  };
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ documentsCount }) => {
  const uploadPercentage = Math.round((documentsCount.uploaded / documentsCount.total) * 100);
  
  // Get mock documents for display
  const documents = generateMockDocuments();
  const recentDocuments = documents.slice(0, 3).map(doc => ({
    name: doc.name,
    type: doc.category,
    status: doc.status || "Valid",
    expiry: doc.expiryDate,
    versions: doc.versions?.length || 1
  }));
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-white to-nexed-50">
        <div>
          <CardTitle className="text-lg font-medium text-nexed-800 flex items-center">
            <FileText size={18} className="text-nexed-600 mr-2" />
            Document Vault
          </CardTitle>
          <CardDescription>Essential documents stored securely</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-nexed-700 hover:text-nexed-800 hover:bg-nexed-50">
            <Search size={14} />
            <span>Search</span>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full text-nexed-700 hover:text-nexed-800 hover:bg-nexed-50">
            <Link to="/app/documents">
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-3">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{uploadPercentage}% uploaded</span>
            <span className="text-nexed-600 font-medium">{documentsCount.uploaded} of {documentsCount.total}</span>
          </div>
          <Progress value={uploadPercentage} className="h-2 bg-gray-100" indicatorClassName="bg-gradient-to-r from-nexed-400 to-nexed-500" />
        </div>
        
        <div className="space-y-1">
          {recentDocuments.map((doc, idx) => (
            <div key={idx} className="group border border-gray-100 rounded-lg hover:border-nexed-200 hover:bg-nexed-50/30 transition-all p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-md bg-nexed-100 flex items-center justify-center text-nexed-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{doc.type}</span>
                      {doc.versions > 1 && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 border-nexed-200 text-nexed-700">
                          {doc.versions} versions
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "valid" ? "bg-green-100 text-green-700" : 
                    doc.status === "expiring" ? "bg-amber-100 text-amber-700 flex items-center gap-1" : 
                    doc.status === "expired" ? "bg-red-100 text-red-700 flex items-center gap-1" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {doc.status === "expiring" && <Clock size={10} />}
                    {doc.status === "expired" && <AlertTriangle size={10} />}
                    {doc.status === "valid" ? "Valid" : 
                     doc.status === "expiring" ? "Expiring Soon" : 
                     doc.status === "expired" ? "Expired" : doc.status}
                  </span>
                  {doc.expiry && (
                    <span className="text-[10px] text-gray-500 mt-1">
                      Expires: {new Date(doc.expiry).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="w-full border-nexed-200 text-nexed-700 hover:bg-nexed-50">
            <Link to="/app/documents" className="flex items-center justify-center gap-2">
              <Search size={16} /> 
              Browse Documents
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="w-full bg-nexed-600 hover:bg-nexed-700">
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
