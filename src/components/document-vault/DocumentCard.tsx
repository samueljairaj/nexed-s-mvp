
import { FileImage, FileText, FileArchive, FilePen, Clock } from "lucide-react";
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

  return (
    <Card className="border relative group hover:shadow-md transition-shadow">
      <div className="absolute top-2 right-2 z-10">
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
        <div className="h-20 w-20 flex items-center justify-center">
          {getFileIcon(document.type)}
        </div>
        <div className="mt-3 w-full">
          <h3 className="font-medium text-gray-900 truncate max-w-[160px] mx-auto">
            {document.name}
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            {document.uploadDate} · {document.size}
          </p>
          
          <div className="mt-2 flex flex-col gap-1 items-center">
            {document.required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
            
            {document.expiryDate && (
              <Badge 
                className={`text-xs flex items-center gap-1 ${getStatusColor(document.status || 'valid')}`}
              >
                <Clock className="w-3 h-3" />
                {document.status === "valid" && "Valid"}
                {document.status === "expiring" && "Expiring Soon"}
                {document.status === "expired" && "Expired"}
              </Badge>
            )}
            
            {document.versions && document.versions.length > 1 && (
              <span className="text-xs text-gray-500">
                v{document.versions.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
