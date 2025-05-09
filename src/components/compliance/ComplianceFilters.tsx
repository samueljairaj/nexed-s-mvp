
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, Sparkles } from "lucide-react";
import { DocumentCategory } from "@/types/document";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  setSelectedPhase,
}: ComplianceFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryOptions: { label: string; value: DocumentCategory; color: string }[] = [
    { label: "Immigration", value: "immigration", color: "bg-blue-500" },
    { label: "Education", value: "education", color: "bg-green-500" },
    { label: "Employment", value: "employment", color: "bg-amber-500" },
    { label: "Personal", value: "personal", color: "bg-purple-500" },
    { label: "Financial", value: "financial", color: "bg-pink-500" },
    { label: "Academic", value: "academic", color: "bg-cyan-500" },
  ];

  const phases = Object.keys(phaseGroups).sort((a, b) => {
    const orderMap: Record<string, number> = {
      "F1": 1,
      "CPT": 2,
      "OPT": 3,
      "STEM OPT": 4,
      "J1": 5,
      "H1B": 6,
      "general": 99
    };
    return (orderMap[a] || 100) - (orderMap[b] || 100);
  });

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {phases.length > 0 && (
          <Select
            value={selectedPhase}
            onValueChange={setSelectedPhase}
          >
            <SelectTrigger className="w-full md:w-[200px] text-left">
              <SelectValue placeholder="Filter by phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Phases</SelectItem>
              {phases.map((phase) => (
                <SelectItem key={phase} value={phase}>
                  {phase === "general" ? "General" : phase}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({phaseGroups[phase].length})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2 md:w-auto">
              <Filter size={16} />
              <span>Filter</span>
              {selectedFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-screen max-w-[300px] p-0" align="end">
            <div className="p-4">
              <p className="text-sm font-medium mb-2">Filter by Category</p>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={selectedFilters.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter(option.value)}
                  >
                    <span className={`w-2 h-2 rounded-full mr-1 ${option.color}`} />
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="p-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsFilterOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button 
          onClick={generateTasksWithAI} 
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Active filters:</span>
          {selectedFilters.map((filter) => {
            const option = categoryOptions.find((opt) => opt.value === filter);
            return (
              <Badge
                key={filter}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleFilter(filter)}
              >
                {option?.label || filter}
                <span className="ml-1">×</span>
              </Badge>
            );
          })}
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0"
            onClick={() => setSelectedFilters([])}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
