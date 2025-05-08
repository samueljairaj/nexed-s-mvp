
import { Button } from "@/components/ui/button";
import { Document, DocumentVersion } from "@/types/document";
import { formatDate } from "@/utils/documentUtils";
import { Eye, ArrowDownToLine, Share, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/utils/documentUtils";
import { useState } from "react";

interface DocumentSidebarProps {
  document: Document;
  onClose: () => void;
  onVersionSelect?: (version: DocumentVersion) => void;
  onShare?: () => void;
  onUpdateExpiry?: () => void;
}

export function DocumentSidebar({ document, onClose, onVersionSelect, onShare, onUpdateExpiry }: DocumentSidebarProps) {
  const [activeVersion, setActiveVersion] = useState<DocumentVersion | null>(
    document.versions && document.versions.length > 0 
      ? document.versions[document.versions.length - 1] 
      : null
  );
  
  const hasVersions = document.versions && document.versions.length > 1;
  
  return (
    <div className="w-80 border-l h-full overflow-y-auto bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Document Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            &times;
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 flex-1">
        <div>
          <h4 className="font-medium text-lg">{document.name}</h4>
          <p className="text-sm text-gray-500">{document.category}</p>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Document Status</label>
            {document.expiryDate ? (
              <Badge className={`mt-1 block w-fit ${getStatusColor(document.status || 'valid')}`}>
                {document.status === "valid" && "Valid"}
                {document.status === "expiring" && "Expiring Soon"}
                {document.status === "expired" && "Expired"}
              </Badge>
            ) : (
              <span className="text-sm block">No expiry date</span>
            )}
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Upload Date</label>
            <div className="text-sm">{document.uploadDate}</div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Expiry Date</label>
            <div className="text-sm flex items-center gap-2">
              {document.expiryDate ? formatDate(document.expiryDate) : "Not set"}
              {onUpdateExpiry && (
                <Button variant="ghost" size="sm" onClick={onUpdateExpiry} className="h-6 p-0">
                  <Clock className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">File Size</label>
            <div className="text-sm">{document.size}</div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">File Type</label>
            <div className="text-sm">{document.type}</div>
          </div>
          
          {document.required && (
            <div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Required Document
              </Badge>
            </div>
          )}
        </div>
        
        {hasVersions && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Document Versions</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {document.versions?.map((version) => (
                <div 
                  key={version.id}
                  className={`p-2 rounded border flex items-center justify-between ${
                    activeVersion?.id === version.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => {
                    setActiveVersion(version);
                    onVersionSelect?.(version);
                  }}
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium">v{version.versionNumber}</div>
                      <div className="text-xs text-gray-500">{version.uploadDate}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={document.fileUrl} download={document.name}>
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
          
          {onShare && (
            <Button variant="outline" className="w-full justify-start" onClick={onShare}>
              <Share className="h-4 w-4 mr-2" />
              Share Document
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
