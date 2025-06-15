
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
import { TaskReminders } from "@/components/compliance/TaskReminders";
import { CalendarView } from "@/components/compliance/CalendarView";
import { DailyTasks } from "@/components/compliance/DailyTasks";
import { useComplianceData } from "@/hooks/useComplianceData";
import { Task } from "@/hooks/useComplianceTasks";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Compliance = () => {
  const {
    tasks,
    isLoading,
    error,
    toggleTaskStatus,
    addCustomTask,
    refreshTasks
  } = useComplianceData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('all_phases');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  const toggleFilter = (category: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleDateClick = (date: Date, tasksForDate: Task[]) => {
    setSelectedDate(date);
    setSelectedDateTasks(tasksForDate);
  };
  
  // Filter tasks based on search query, category filters, and phase
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedFilters.length === 0 || 
      selectedFilters.includes(task.category);
    
    const matchesPhase = selectedPhase === 'all_phases' || 
      task.phase === selectedPhase;
    
    return matchesSearch && matchesCategory && matchesPhase;
  });

  // Group tasks by phase
  const phaseGroups = tasks.reduce((groups: {[key: string]: Task[]}, task) => {
    const phase = task.phase || 'general';
    if (!groups[phase]) {
      groups[phase] = [];
    }
    
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedFilters.length === 0 || 
      selectedFilters.includes(task.category);
      
    if (matchesSearch && matchesCategory) {
      groups[phase].push(task);
    }
    
    return groups;
  }, {});

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

  if (error) {
    return (
      <div className="space-y-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Compliance Center</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your visa compliance tasks
          </p>
        </header>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load compliance tasks: {error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshTasks}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Center</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your visa compliance tasks
            </p>
          </div>
          <Button variant="outline" onClick={refreshTasks} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Status Summary Card */}
      <ComplianceStatusSummary tasks={tasks} />

      {/* Search, Filter, and Phase selector */}
      <ComplianceFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        phaseGroups={phaseGroups}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
        setSelectedFilters={setSelectedFilters}
      />

      {/* Reminders Section */}
      {tasks.length > 0 && (
        <div className="mb-8">
          <TaskReminders 
            tasks={tasks} 
            toggleTaskStatus={toggleTaskStatus} 
            onAddCustomReminder={addCustomTask}
          />
        </div>
      )}

      {/* Calendar and Daily Tasks View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CalendarView tasks={tasks} onDateClick={handleDateClick} />
        <DailyTasks 
          date={selectedDate} 
          tasks={selectedDateTasks} 
          toggleTaskStatus={toggleTaskStatus} 
        />
      </div>

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
