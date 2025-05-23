
import { FileImage, FileText, FileArchive, FilePen, Clock, AlertTriangle, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/types/document";
import { getStatusColor, formatDate } from "@/utils/documentUtils";
import { DocumentActions } from "./DocumentActions";

interface DocumentCardProps {
  document: Document;
  onSelect: (doc: Document) => void;
  onDelete: (id: string) => void;
  onRename: (doc: Document) => void;
  onToggleRequired: (id: string) => void;
}

export function DocumentCard({ document, onSelect, onDelete, onRename, onToggleRequired }: DocumentCardProps) {
  // Generate file icon based on mime type
  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return <FileImage size={40} className="text-blue-400" />;
    } else if (type.includes('pdf')) {
      return <FileText size={40} className="text-red-400" />;
    } else if (type.includes('zip') || type.includes('rar')) {
      return <FileArchive size={40} className="text-amber-400" />;
    } else {
      return <FilePen size={40} className="text-gray-400" />;
    }
  };

  // Get expiry status text
  const getExpiryStatusText = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case "valid": return "Valid";
      case "expiring": return "Expiring Soon";
      case "expired": return "Expired";
      default: return null;
    }
  };

  // Get expiry status icon
  const getExpiryStatusIcon = (status?: string) => {
    if (!status || status === "valid") return null;
    return status === "expired" ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />;
  };

  // Smart category display
  const categoryDisplay = document.detected_type || document.category;
  
  // Calculate versions count
  const versionsCount = document.versions?.length || 1;

  return (
    <Card 
      className="relative group border border-gray-100 hover:border-nexed-200 transition-all duration-300 hover:shadow-md overflow-hidden" 
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DocumentActions
          doc={document}
          onDelete={() => onDelete(document.id)}
          onRename={() => onRename(document)}
          onToggleRequired={() => onToggleRequired(document.id)}
          onSelect={() => onSelect(document)}
        />
      </div>
      <div 
        className="p-4 flex flex-col items-center text-center cursor-pointer"
        onClick={() => onSelect(document)}
      >
        <div className="h-20 w-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          {getFileIcon(document.type)}
        </div>
        <div className="mt-3 w-full">
          <h3 className="font-medium text-gray-900 truncate max-w-[160px] mx-auto">
            {document.name}
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            {document.uploadDate} · {document.size}
          </p>
          
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {document.required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
            
            {document.expiryDate && document.status && (
              <Badge 
                variant={document.status === "valid" ? "outline" : document.status === "expiring" ? "warning" : "destructive"}
                className="text-xs flex items-center gap-1"
              >
                {getExpiryStatusIcon(document.status)}
                {getExpiryStatusText(document.status)}
              </Badge>
            )}
            
            {versionsCount > 1 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 border-nexed-200 text-nexed-700">
                <History className="w-3 h-3" />
                {versionsCount} versions
              </Badge>
            )}
            
            {document.tags && document.tags.length > 0 && (
              <div className="w-full mt-1 flex flex-wrap gap-1 justify-center">
                {document.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
                {document.tags.length > 2 && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                    +{document.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
