
import { useState } from "react";
import { DocumentVersion } from "@/types/document";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Download, History, Check, Clock } from "lucide-react";

interface DocumentVersionHistoryProps {
  versions: DocumentVersion[];
  currentVersion: number;
  onSelectVersion: (version: DocumentVersion) => void;
}

export function DocumentVersionHistory({
  versions,
  currentVersion,
  onSelectVersion
}: DocumentVersionHistoryProps) {
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion>(
    sortedVersions.find(v => v.versionNumber === currentVersion) || sortedVersions[0]
  );

  const handleVersionSelect = (version: DocumentVersion) => {
    setSelectedVersion(version);
    onSelectVersion(version);
  };

  if (!versions.length) {
    return (
      <div className="text-center py-4">
        <History className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No version history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <History size={16} className="text-nexed-600" />
          Version History
        </h3>
        <span className="text-xs text-gray-500">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      <ScrollArea className="max-h-64 pr-2">
        <div className="space-y-2">
          {sortedVersions.map((version) => (
            <div
              key={version.id}
              className={`p-3 border rounded-md cursor-pointer transition-all ${
                selectedVersion.id === version.id
                  ? "border-nexed-300 bg-nexed-50"
                  : "border-gray-100 hover:border-nexed-200"
              }`}
              onClick={() => handleVersionSelect(version)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                    selectedVersion.id === version.id ? "bg-nexed-100 text-nexed-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {selectedVersion.id === version.id ? (
                      <Check size={14} />
                    ) : (
                      <span className="text-xs font-medium">v{version.versionNumber}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium flex items-center">
                      Version {version.versionNumber}
                      {version.versionNumber === currentVersion && (
                        <Badge className="ml-2 text-[10px] h-4 px-1 bg-green-100 text-green-700 font-normal">Current</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                      <Clock size={12} className="mr-1" />
                      {new Date(version.uploadDate).toLocaleDateString()}, {version.size}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Download size={14} />
                </Button>
              </div>
              {version.notes && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {version.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" className="text-xs h-7">
          <ArrowLeft size={14} className="mr-1" /> Previous
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-7">
          Next <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
