
import React from "react";
import { TaskList } from "@/components/compliance/TaskList";
import { Task } from "@/hooks/useComplianceTasks";
import { FileCheck } from "lucide-react";

interface PhaseGroupedTasksProps {
  phaseGroups: {[key: string]: Task[]};
  toggleTaskStatus: (id: string) => void;
  selectedPhase: string;
  selectedFilters: string[];
  searchQuery: string;
}

export function PhaseGroupedTasks({
  phaseGroups,
  toggleTaskStatus,
  selectedPhase,
  selectedFilters,
  searchQuery
}: PhaseGroupedTasksProps) {
  // Order the phases in a logical sequence
  const orderedPhases = ["F1", "CPT", "OPT", "STEM OPT", "J1", "H1B", "general"];
  
  // Sort the phase keys based on the ordered phases
  const sortedPhaseKeys = Object.keys(phaseGroups)
    .filter(phase => selectedPhase ? phase === selectedPhase : true)
    .sort((a, b) => {
      const indexA = orderedPhases.indexOf(a) !== -1 ? orderedPhases.indexOf(a) : 999;
      const indexB = orderedPhases.indexOf(b) !== -1 ? orderedPhases.indexOf(b) : 999;
      return indexA - indexB;
    });

  if (sortedPhaseKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No phases match your criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedPhaseKeys.map(phase => (
        <div key={phase}>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <FileCheck className="mr-2" size={20} />
            {phase} Documents
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {phaseGroups[phase].length} items
            </span>
          </h2>
          <TaskList
            tasks={phaseGroups[phase].filter(task => 
              (selectedFilters.length === 0 || selectedFilters.includes(task.category)) &&
              (!searchQuery || 
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
              )
            )}
            toggleTaskStatus={toggleTaskStatus}
            emptyMessage={`No tasks for ${phase} phase match your criteria`}
          />
        </div>
      ))}
    </div>
  );
}
