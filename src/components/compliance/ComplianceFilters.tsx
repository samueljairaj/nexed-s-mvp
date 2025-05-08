
import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentCategory } from "@/types/document";

interface ComplianceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilters: DocumentCategory[];
  toggleFilter: (filter: DocumentCategory) => void;
  isGenerating: boolean;
  generateTasksWithAI: () => void;
  phaseGroups: {[key: string]: any[]};
  selectedPhase: string;
  setSelectedPhase: (phase: string) => void;
}

export function ComplianceFilters({
  searchQuery,
  setSearchQuery,
  selectedFilters,
  toggleFilter,
  isGenerating,
  generateTasksWithAI,
  phaseGroups,
  selectedPhase,
  setSelectedPhase
}: ComplianceFiltersProps) {
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={selectedFilters.includes("immigration") ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => toggleFilter("immigration")}
          >
            Immigration
          </Badge>
          <Badge 
            variant={selectedFilters.includes("academic") ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => toggleFilter("academic")}
          >
            Academic
          </Badge>
          <Badge 
            variant={selectedFilters.includes("employment") ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => toggleFilter("employment")}
          >
            Employment
          </Badge>
          <Badge 
            variant={selectedFilters.includes("personal") ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => toggleFilter("personal")}
          >
            Personal
          </Badge>
          <Badge 
            variant={selectedFilters.includes("education") ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => toggleFilter("education")}
          >
            Education
          </Badge>
          <Badge 
            variant={selectedFilters.includes("financial") ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => toggleFilter("financial")}
          >
            Financial
          </Badge>
          
          {/* AI Task Generation Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateTasksWithAI}
            disabled={isGenerating}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? "animate-spin" : ""}`} />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Phase Filter */}
      {Object.keys(phaseGroups).length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge
            variant={selectedPhase === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedPhase("")}
          >
            All Phases
          </Badge>
          {Object.keys(phaseGroups).map(phase => (
            <Badge
              key={phase}
              variant={selectedPhase === phase ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedPhase(phase)}
            >
              {phase}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
