
import { Document } from "@/types/document";
import { DocumentCard } from "./DocumentCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentGridProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onRenameDocument: (doc: Document) => void;
  onToggleRequired: (id: string) => void;
  emptyMessage?: string;
}

export function DocumentGrid({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onRenameDocument,
  onToggleRequired,
  emptyMessage = "No documents found"
}: DocumentGridProps) {
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onSelect={onSelectDocument}
            onDelete={onDeleteDocument}
            onRename={onRenameDocument}
            onToggleRequired={onToggleRequired}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
