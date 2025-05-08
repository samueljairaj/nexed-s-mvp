
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentCategory } from "@/types/document";

interface DocumentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList, category: DocumentCategory, expiryDate?: string) => void;
  defaultCategory?: DocumentCategory;
}

export function DocumentUploader({ isOpen, onClose, onUpload, defaultCategory }: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(defaultCategory || "personal");
  const [expiryDate, setExpiryDate] = useState<string>("");

  const categories: DocumentCategory[] = ["immigration", "education", "employment", "personal", "financial"];

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Convert FileList to array for easier handling
    const fileArray = Array.from(files);
    setDraggedFiles(fileArray);
    
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      // Pass the files, category and expiry date to the parent component
      onUpload(files, selectedCategory, expiryDate);
      
      // Reset state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setDraggedFiles([]);
        onClose();
      }, 500);
    }, 3000);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload files to your document vault. You can upload multiple files at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                id="expiryDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
          
          <div
            className={`flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
              isDragActive ? "bg-blue-50 border-blue-300" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload
                className="mx-auto h-12 w-12 text-gray-300"
                aria-hidden="true"
              />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-nexed-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-nexed-500 hover:text-nexed-500"
                >
                  <span>Click to upload</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PDF, PNG, JPG, DOCX up to 10MB each
              </p>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading {draggedFiles.length} file(s)...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-nexed-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            {draggedFiles.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600 max-h-24 overflow-y-auto">
                {draggedFiles.map((file, index) => (
                  <li key={index} className="truncate">
                    {file.name} ({formatFileSize(file.size)})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <label
            htmlFor="file-upload-btn"
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 nexed-gradient ${
              isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isUploading ? "Uploading..." : "Select Files"}
            <input
              id="file-upload-btn"
              type="file"
              className="sr-only"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={isUploading}
            />
          </label>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
