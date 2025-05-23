
import { Document } from "@/types/document";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, FileImage, FileArchive, FilePen, Clock, AlertTriangle } from "lucide-react";
import { DocumentActions } from "./DocumentActions";
import { getStatusColor } from "@/utils/documentUtils";

interface DocumentListProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onRenameDocument: (doc: Document) => void;
  onToggleRequired: (id: string) => void;
  emptyMessage?: string;
}

export function DocumentList({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onRenameDocument,
  onToggleRequired,
  emptyMessage = "No documents found"
}: DocumentListProps) {
  // Generate file icon based on mime type
  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return <FileImage size={20} className="text-blue-400" />;
    } else if (type.includes('pdf')) {
      return <FileText size={20} className="text-red-400" />;
    } else if (type.includes('zip') || type.includes('rar')) {
      return <FileArchive size={20} className="text-amber-400" />;
    } else {
      return <FilePen size={20} className="text-gray-400" />;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status?: string) => {
    if (!status || status === "valid") return null;
    return status === "expired" ? 
      <AlertTriangle className="w-3 h-3 mr-1" /> : 
      <Clock className="w-3 h-3 mr-1" />;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
          <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">{emptyMessage}</h3>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr 
                key={doc.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectDocument(doc)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      {doc.versions && doc.versions.length > 1 && (
                        <div className="text-xs text-gray-500">Version {doc.versions.length}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="capitalize">{doc.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.uploadDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {doc.status ? (
                    <Badge className={`flex items-center ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      {doc.status === "valid" && "Valid"}
                      {doc.status === "expiring" && "Expiring Soon"}
                      {doc.status === "expired" && "Expired"}
                    </Badge>
                  ) : doc.required ? (
                    <Badge variant="secondary">Required</Badge>
                  ) : (
                    <span className="text-gray-500 text-sm">--</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div onClick={(e) => e.stopPropagation()}>
                    <DocumentActions
                      doc={doc}
                      onDelete={() => onDeleteDocument(doc.id)}
                      onRename={() => onRenameDocument(doc)}
                      onToggleRequired={() => onToggleRequired(doc.id)}
                      onSelect={() => onSelectDocument(doc)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
