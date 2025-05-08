
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentCategory } from "@/types/document";

interface FolderCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, category: DocumentCategory) => void;
  defaultCategory?: DocumentCategory;
}

export function FolderCreationDialog({ 
  isOpen, 
  onClose, 
  onCreateFolder,
  defaultCategory = "personal" 
}: FolderCreationDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(defaultCategory);
  
  const categories: DocumentCategory[] = ["immigration", "education", "employment", "personal", "financial", "other"];

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    onCreateFolder(folderName, selectedCategory);
    setFolderName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your documents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
              Folder Name
            </label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </div>

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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolder}
            disabled={!folderName.trim()}
          >
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
