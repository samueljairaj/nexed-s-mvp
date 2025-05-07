
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  FileText, 
  FolderClosed, 
  FolderOpen, 
  Plus, 
  Search, 
  Tag,
  Trash2, 
  Upload, 
  X,
  FileImage,
  FileArchive,
  FilePen
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Document interface
interface Document {
  id: string;
  name: string;
  type: string;
  category: "immigration" | "education" | "employment" | "personal";
  uploadDate: string;
  size: string;
  required: boolean;
  fileUrl: string;
}

// Mock categories and their descriptions
const categories = [
  { 
    id: "immigration", 
    name: "Immigration", 
    description: "Visa, passport, I-20, and other immigration documents",
    icon: <FileText className="h-5 w-5 text-red-500" />,
    color: "bg-red-50 border-red-200" 
  },
  { 
    id: "education", 
    name: "Education", 
    description: "Admission letter, transcripts, degree certificates",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    color: "bg-blue-50 border-blue-200" 
  },
  { 
    id: "employment", 
    name: "Employment", 
    description: "Offer letters, EAD card, employment verification",
    icon: <FileText className="h-5 w-5 text-green-500" />,
    color: "bg-green-50 border-green-200" 
  },
  { 
    id: "personal", 
    name: "Personal", 
    description: "ID cards, driver's license, lease agreements",
    icon: <FileText className="h-5 w-5 text-amber-500" />,
    color: "bg-amber-50 border-amber-200" 
  },
];

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

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Load mock documents
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocuments(mockDocuments);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? doc.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Group documents by category
  const documentsByCategory: Record<string, Document[]> = {};
  categories.forEach(category => {
    documentsByCategory[category.id] = filteredDocuments.filter(
      doc => doc.category === category.id
    );
  });

  // Upload document handler
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
      
      // Add new documents (simulating server response)
      const newDocs: Document[] = fileArray.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        category: activeCategory as any || "personal", // Default to personal if no category selected
        uploadDate: new Date().toLocaleDateString(),
        size: formatFileSize(file.size),
        required: false,
        fileUrl: URL.createObjectURL(file)
      }));
      
      setDocuments(prev => [...prev, ...newDocs]);
      
      // Reset state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setDraggedFiles([]);
        setIsUploadDialogOpen(false);
        
        toast({
          title: "Upload complete",
          description: `${fileArray.length} document(s) uploaded successfully.`,
        });
      }, 500);
    }, 3000);
  };

  // Delete document handler
  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Document deleted",
      description: "The document has been removed from your vault.",
    });
    setSelectedDocument(null);
  };

  // Toggle required status
  const toggleRequired = (id: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, required: !doc.required } : doc
      )
    );
    
    const doc = documents.find(d => d.id === id);
    const newStatus = !doc?.required;
    
    toast({
      title: newStatus ? "Marked as Required" : "Marked as Optional",
      description: doc?.name,
    });
  };

  // Rename document handler
  const handleRenameDocument = () => {
    if (!selectedDocument || !newFileName.trim()) return;
    
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === selectedDocument.id ? { ...doc, name: newFileName } : doc
      )
    );
    
    toast({
      title: "Document renamed",
      description: `Renamed to "${newFileName}"`,
    });
    
    setIsRenameDialogOpen(false);
    setNewFileName("");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Document Vault</h1>
            <p className="text-gray-600 mt-2">
              Securely store and manage your important documents
            </p>
          </div>
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="nexed-gradient"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search documents..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              activeCategory === category.id ? "border-2 border-nexed-500" : ""
            } ${category.color}`}
            onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-md bg-white">
                {activeCategory === category.id ? <FolderOpen size={24} /> : <FolderClosed size={24} />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-gray-500 text-xs">
                  {documentsByCategory[category.id]?.length || 0} documents
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document List */}
      <Card className="nexed-card">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                {activeCategory
                  ? categories.find(c => c.id === activeCategory)?.name
                  : "All Documents"}
              </CardTitle>
              <CardDescription>
                {activeCategory
                  ? categories.find(c => c.id === activeCategory)?.description
                  : "All your uploaded documents"}
              </CardDescription>
            </div>
            {activeCategory && (
              <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)}>
                <X size={16} className="mr-2" /> Clear filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="grid">
            <div className="px-6 pt-2 pb-0 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                </span>
              </div>
              <TabsList className="grid grid-cols-2 w-[160px]">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-gray-500">
                  {searchQuery 
                    ? "Try changing your search query or filters." 
                    : "Start by uploading your first document."}
                </p>
                <Button 
                  onClick={() => setIsUploadDialogOpen(true)} 
                  className="mt-4"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <>
                <TabsContent value="grid" className="m-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                    {filteredDocuments.map((doc) => (
                      <Card 
                        key={doc.id}
                        className="border relative group"
                      >
                        <div className="absolute top-2 right-2 z-10">
                          <DocumentActions
                            doc={doc}
                            onDelete={() => handleDeleteDocument(doc.id)}
                            onPreview={() => {
                              setSelectedDocument(doc);
                              setIsPreviewOpen(true);
                            }}
                            onRename={() => {
                              setSelectedDocument(doc);
                              setNewFileName(doc.name);
                              setIsRenameDialogOpen(true);
                            }}
                            onToggleRequired={() => toggleRequired(doc.id)}
                          />
                        </div>
                        <div 
                          className="p-4 flex flex-col items-center text-center cursor-pointer"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsPreviewOpen(true);
                          }}
                        >
                          <div className="h-20 w-20 flex items-center justify-center">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="mt-3">
                            <h3 className="font-medium text-gray-900 truncate w-full max-w-[160px]">
                              {doc.name}
                            </h3>
                            <p className="text-gray-500 text-xs mt-1">
                              {doc.uploadDate} · {doc.size}
                            </p>
                          </div>
                          {doc.required && (
                            <Badge variant="secondary" className="mt-2">Required</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="list" className="m-0">
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
                        {filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                                  {getFileIcon(doc.type)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{doc.name}</div>
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
                              {doc.required ? (
                                <Badge variant="secondary">Required</Badge>
                              ) : (
                                <span className="text-gray-500 text-sm">Optional</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DocumentActions
                                doc={doc}
                                onDelete={() => handleDeleteDocument(doc.id)}
                                onPreview={() => {
                                  setSelectedDocument(doc);
                                  setIsPreviewOpen(true);
                                }}
                                onRename={() => {
                                  setSelectedDocument(doc);
                                  setNewFileName(doc.name);
                                  setIsRenameDialogOpen(true);
                                }}
                                onToggleRequired={() => toggleRequired(doc.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload files to your document vault. You can upload multiple files at once.
            </DialogDescription>
          </DialogHeader>
          
          <div
            className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
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
              onClick={() => setIsUploadDialogOpen(false)}
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

      {/* Document Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="bg-gray-100 p-2 mb-4 rounded-md flex justify-between items-center">
                  <div>
                    <span className="font-medium">{selectedDocument.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({selectedDocument.size})</span>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRequired(selectedDocument.id)}
                    >
                      <Tag size={16} className="mr-2" />
                      {selectedDocument.required ? "Mark as Optional" : "Mark as Required"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto bg-gray-50 rounded-md flex items-center justify-center">
                  {selectedDocument.type.includes('image') ? (
                    <img
                      src={selectedDocument.fileUrl}
                      alt={selectedDocument.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : selectedDocument.type.includes('pdf') ? (
                    <div className="text-center">
                      <FileText size={80} className="mx-auto text-red-400" />
                      <p className="mt-2">PDF Preview</p>
                      <Button className="mt-2">
                        <a href={selectedDocument.fileUrl} target="_blank" rel="noreferrer">
                          Open PDF
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText size={80} className="mx-auto text-gray-400" />
                      <p className="mt-2">Preview not available</p>
                      <Button className="mt-2">
                        <a href={selectedDocument.fileUrl} download={selectedDocument.name}>
                          Download File
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <div className="flex justify-between w-full">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleDeleteDocument(selectedDocument.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNewFileName(selectedDocument.name);
                        setIsRenameDialogOpen(true);
                        setIsPreviewOpen(false);
                      }}
                    >
                      <FilePen size={16} className="mr-2" />
                      Rename
                    </Button>
                  </div>
                  <Button onClick={() => setIsPreviewOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenameDocument} 
              disabled={!newFileName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Document Actions Component
const DocumentActions = ({ 
  doc, 
  onDelete, 
  onPreview,
  onRename,
  onToggleRequired
}: { 
  doc: Document, 
  onDelete: () => void, 
  onPreview: () => void,
  onRename: () => void,
  onToggleRequired: () => void
}) => {
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
        <DropdownMenuItem onClick={onPreview}>
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
};

// Mock documents data
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Passport.pdf",
    type: "application/pdf",
    category: "immigration",
    uploadDate: "May 5, 2025",
    size: "2.4 MB",
    required: true,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-2",
    name: "I-20.pdf",
    type: "application/pdf",
    category: "immigration",
    uploadDate: "May 2, 2025",
    size: "1.2 MB",
    required: true,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-3",
    name: "University Admission Letter.pdf",
    type: "application/pdf",
    category: "education",
    uploadDate: "Apr 28, 2025",
    size: "543 KB",
    required: false,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-4",
    name: "Transcript.pdf",
    type: "application/pdf",
    category: "education",
    uploadDate: "Apr 25, 2025",
    size: "1.8 MB",
    required: false,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-5",
    name: "Employment Offer Letter.pdf",
    type: "application/pdf",
    category: "employment",
    uploadDate: "Apr 20, 2025",
    size: "378 KB",
    required: true,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-6",
    name: "Driver's License.jpg",
    type: "image/jpeg",
    category: "personal",
    uploadDate: "Apr 15, 2025",
    size: "1.1 MB",
    required: false,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-7",
    name: "Apartment Lease.pdf",
    type: "application/pdf",
    category: "personal",
    uploadDate: "Apr 10, 2025",
    size: "2.3 MB",
    required: false,
    fileUrl: "/placeholder.svg"
  },
  {
    id: "doc-8",
    name: "Health Insurance.pdf",
    type: "application/pdf",
    category: "personal",
    uploadDate: "Apr 5, 2025",
    size: "980 KB",
    required: true,
    fileUrl: "/placeholder.svg"
  }
];

export default Documents;
