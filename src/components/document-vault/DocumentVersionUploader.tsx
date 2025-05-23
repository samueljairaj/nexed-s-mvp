
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Document } from "@/types/document";
import { Upload, History } from "lucide-react";

interface DocumentVersionUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  onUploadVersion: (files: FileList, notes: string) => void;
}

export function DocumentVersionUploader({
  isOpen,
  onClose,
  document,
  onUploadVersion
}: DocumentVersionUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      // Create a FileList-like object since FileList is readonly
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(selectedFile);
      const fileList = dataTransfer.files;
      
      await onUploadVersion(fileList, notes);
      onClose();
    } catch (error) {
      console.error("Error uploading new version:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-nexed-600" />
            Upload New Version
          </DialogTitle>
          <DialogDescription>
            Upload a new version of "{document.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="file" className="text-sm font-medium">
              Select File
            </label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500">
              Current version: {document.versions?.length || 1}
            </p>
          </div>
          
          <div className="grid w-full gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium">
              Version Notes (Optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Describe what changed in this version..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="gap-1"
          >
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
