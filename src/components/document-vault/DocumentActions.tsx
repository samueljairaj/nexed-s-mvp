
import { Button } from "@/components/ui/button";
import { Document } from "@/types/document";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Eye, FilePen, Tag, Trash2, Share, Clock } from "lucide-react";

interface DocumentActionsProps {
  doc: Document;
  onDelete: () => void;
  onRename: () => void;
  onToggleRequired: () => void;
  onSelect: () => void;
  onUpdateExpiry?: () => void;
  onShare?: () => void;
  onCreatePacket?: () => void;
}

export function DocumentActions({ 
  doc, 
  onDelete, 
  onRename, 
  onToggleRequired, 
  onSelect, 
  onUpdateExpiry,
  onShare,
  onCreatePacket
}: DocumentActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSelect}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Preview</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onRename}>
          <FilePen className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onToggleRequired}>
          <Tag className="mr-2 h-4 w-4" />
          <span>{doc.required ? "Mark as Optional" : "Mark as Required"}</span>
        </DropdownMenuItem>
        
        {onUpdateExpiry && (
          <DropdownMenuItem onClick={onUpdateExpiry}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Update Expiry</span>
          </DropdownMenuItem>
        )}
        
        {onShare && (
          <DropdownMenuItem onClick={onShare}>
            <Share className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
        )}
        
        {onCreatePacket && (
          <DropdownMenuItem onClick={onCreatePacket}>
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 9h6v6H9z"/><path d="M15 4v16"/></svg>
            <span>Add to Packet</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
