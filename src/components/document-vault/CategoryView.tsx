
import { DocumentCategory, Document } from "@/types/document";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FolderOpen, FolderClosed } from "lucide-react";

interface CategoryViewProps {
  categories: Array<{
    id: DocumentCategory;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }>;
  documents: Document[];
  activeCategory: DocumentCategory | null;
  onCategorySelect: (category: DocumentCategory | null) => void;
}

export function CategoryView({ categories, documents, activeCategory, onCategorySelect }: CategoryViewProps) {
  // Group documents by category
  const documentsByCategory: Record<string, Document[]> = {};
  categories.forEach(category => {
    documentsByCategory[category.id] = documents.filter(
      doc => doc.category === category.id
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            activeCategory === category.id ? "border-2 border-nexed-500" : ""
          } ${category.color}`}
          onClick={() => onCategorySelect(activeCategory === category.id ? null : category.id)}
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
  );
}
