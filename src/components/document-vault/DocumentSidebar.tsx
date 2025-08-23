
import { useState } from "react";
import {
  X,
  Calendar,
  FileText,
  Download,
  Share,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pencil,
  History,
  Upload
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { Document, DocumentVersion } from "@/types/document";
import { formatDate } from "@/utils/documentUtils";
import { DocumentVersionHistory } from "./DocumentVersionHistory";
import { DocumentVersionUploader } from "./DocumentVersionUploader";

interface DocumentSidebarProps {
  document: Document;
  onClose: () => void;
  onUpdateExpiry: () => void;
  onShare: () => void;
}

export function DocumentSidebar({
  document,
  onClose,
  onUpdateExpiry,
  onShare
}: DocumentSidebarProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "versions">("preview");
  const [isVersionUploadOpen, setIsVersionUploadOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(
    document.versions?.find(v => v.is_current) || document.versions?.[0]
  );
  
  const handleVersionSelect = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };

  // Handle upload new version
  const handleNewVersion = () => {
    setIsVersionUploadOpen(true);
  };
  
  const handleUploadVersion = (files: FileList, notes: string) => {
    // Call the version upload handler from the parent component
    console.log("Uploading new version", files, notes);
    // This would call a function passed from the parent
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-nexed-600" />
              <span className="truncate">{document.name}</span>
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X size={16} />
              </Button>
            </SheetClose>
          </div>
          
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="outline">
              {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
            </Badge>
            
            {document.required && (
              <Badge variant="secondary">Required</Badge>
            )}
            
            {document.status === "valid" && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle size={12} />
                Valid
              </Badge>
            )}
            
            {document.status === "expiring" && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <Clock size={12} />
                Expiring Soon
              </Badge>
            )}
            
            {document.status === "expired" && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                <AlertTriangle size={12} />
                Expired
              </Badge>
            )}
            
            {document.detected_type && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {document.detected_type}
              </Badge>
            )}
          </div>
          
          <div className="mt-3 flex gap-1">
            <Button
              variant={activeTab === "preview" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("preview")}
              className="flex-1"
            >
              Preview
            </Button>
            <Button
              variant={activeTab === "versions" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("versions")}
              className="flex-1"
            >
              Versions {document.versions && document.versions.length > 0 && `(${document.versions.length})`}
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-auto">
          {activeTab === "preview" ? (
            <div className="p-4 space-y-6">
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg min-h-[300px]">
                {document.type.includes('image') ? (
                  <img 
                    src={(selectedVersion?.fileUrl || document.fileUrl) || "/placeholder.svg"} 
                    alt={document.name}
                    className="max-w-full max-h-[400px] rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileText size={64} className="text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">
                      Preview not available for this document type
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1">
                      <Download size={14} />
                      Download to View
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Upload Date</label>
                    <p className="text-sm">{document.uploadDate}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">File Size</label>
                    <p className="text-sm">{document.size}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">File Type</label>
                    <p className="text-sm">{document.type.split('/')[1]?.toUpperCase() || document.type}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Version</label>
                    <p className="text-sm">
                      {selectedVersion ? `v${selectedVersion.versionNumber}` : 'v1'} 
                      {document.versions && document.versions.length > 1 && ` of ${document.versions.length}`}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-gray-500">Expiry Date</label>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onUpdateExpiry}>
                      <Pencil size={12} className="mr-1" /> Edit
                    </Button>
                  </div>
                  <div className="flex items-center text-sm">
                    {document.expiryDate ? (
                      <>
                        <Calendar size={14} className="mr-1.5 text-gray-500" />
                        {formatDate(document.expiryDate)}
                      </>
                    ) : (
                      <span className="text-gray-500">No expiry date set</span>
                    )}
                  </div>
                </div>
                
                {document.tags && document.tags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <DocumentVersionHistory 
                versions={document.versions || []} 
                currentVersion={document.versions?.find(v => v.is_current)?.versionNumber || 1}
                onSelectVersion={handleVersionSelect}
              />
            </div>
          )}
        </div>
        
        <div className="p-4 border-t mt-auto">
          <div className="grid grid-cols-2 gap-2">
            {activeTab === "preview" && (
              <>
                <Button variant="outline" size="sm" onClick={onShare} className="gap-1">
                  <Share size={14} />
                  Share
                </Button>
                <Button variant="default" size="sm" className="gap-1">
                  <Download size={14} />
                  Download
                </Button>
              </>
            )}
            {activeTab === "versions" && (
              <>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download size={14} />
                  Download
                </Button>
                <Button variant="default" size="sm" onClick={handleNewVersion} className="gap-1">
                  <Upload size={14} />
                  New Version
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
      
      <DocumentVersionUploader
        isOpen={isVersionUploadOpen}
        onClose={() => setIsVersionUploadOpen(false)}
        document={document}
        onUploadVersion={handleUploadVersion}
      />
    </Sheet>
  );
}
