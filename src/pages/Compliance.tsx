
import { useState } from "react";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TimelineView } from "@/components/compliance/TimelineView";
import { TaskList } from "@/components/compliance/TaskList";
import { ComplianceStatusSummary } from "@/components/compliance/ComplianceStatusSummary";
import { ComplianceFilters } from "@/components/compliance/ComplianceFilters";
import { PhaseGroupedTasks } from "@/components/compliance/PhaseGroupedTasks";
import { useComplianceTasks, Task } from "@/hooks/useComplianceTasks";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Compliance = () => {
  const {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    toggleFilter,
    selectedPhase,
    setSelectedPhase,
    isLoading,
    isGenerating,
    phaseGroups,
    toggleTaskStatus,
    generateTasksWithAI
  } = useComplianceTasks();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Compliance Center</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your visa compliance tasks
          </p>
        </header>
        
        <div className="flex justify-center items-center flex-col h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexed-500"></div>
          <p className="text-gray-600">Loading compliance tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Compliance Center</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your visa compliance tasks
        </p>
      </header>

      {/* Status Summary Card */}
      <ComplianceStatusSummary tasks={tasks} />

      {/* Search, Filter, and Phase selector */}
      <ComplianceFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        isGenerating={isGenerating}
        generateTasksWithAI={generateTasksWithAI}
        phaseGroups={phaseGroups}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
      />

      {/* Initial AI Generation Prompt - show if no tasks are available */}
      {tasks.length === 0 && !isGenerating && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-center mb-8">
          <Sparkles className="h-10 w-10 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Generate Personalized Compliance Tasks</h3>
          <p className="text-gray-600 mb-4">
            Get a personalized checklist of compliance tasks based on your visa status and profile information.
          </p>
          <Button
            onClick={generateTasksWithAI}
            className="gap-2"
            size="lg"
          >
            <Sparkles className="h-4 w-4" /> Generate Tasks with AI
          </Button>
        </div>
      )}

      {/* Task Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="by-phase">By Phase</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskList 
            tasks={filteredTasks} 
            toggleTaskStatus={toggleTaskStatus}
            emptyMessage="No tasks match your search criteria"
          />
        </TabsContent>

        <TabsContent value="by-phase">
          <PhaseGroupedTasks
            phaseGroups={phaseGroups}
            toggleTaskStatus={toggleTaskStatus}
            selectedPhase={selectedPhase}
            selectedFilters={selectedFilters}
            searchQuery={searchQuery}
          />
        </TabsContent>

        <TabsContent value="pending">
          <TaskList 
            tasks={filteredTasks.filter(task => !task.completed)} 
            toggleTaskStatus={toggleTaskStatus}
            emptyMessage="No pending tasks"
          />
        </TabsContent>

        <TabsContent value="completed">
          <TaskList 
            tasks={filteredTasks.filter(task => task.completed)} 
            toggleTaskStatus={toggleTaskStatus}
            emptyMessage="No completed tasks yet"
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineView tasks={filteredTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Compliance;
