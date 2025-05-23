
import { useState, useEffect } from "react";
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
import { Task } from "@/hooks/useComplianceTasks";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskReminders } from "@/components/compliance/TaskReminders";
import { CalendarView } from "@/components/compliance/CalendarView";
import { DailyTasks } from "@/components/compliance/DailyTasks";
import { generateMockTasks } from "@/utils/mockTasks";

// Create a mock implementation for the UI first, separate from backend
const ComplianceUI = () => {
  // Static mock data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('all_phases');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  // Initialize with mock data on first render
  useEffect(() => {
    // Short timeout to simulate loading
    const timer = setTimeout(() => {
      const mockData = generateMockTasks('F1');
      setTasks(mockData);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Create local state management functions
  const toggleFilter = (category: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  };

  const generateTasksWithAI = () => {
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const mockData = generateMockTasks('F1');
      setTasks(mockData);
      setIsGenerating(false);
    }, 1500);
  };

  // Add a custom task or reminder
  const handleAddCustomReminder = (title: string, dueDate: string, priority: "low" | "medium" | "high") => {
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      title,
      description: "Custom reminder",
      dueDate,
      priority,
      category: "personal",
      phase: "general",
      completed: false
    };
    
    setTasks(prev => [...prev, newTask]);
  };

  // Handle calendar date selection
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
        setSelectedFilters={setSelectedFilters}
      />

      {/* Reminders Section */}
      {tasks.length > 0 && (
        <div className="mb-8">
          <TaskReminders 
            tasks={tasks} 
            toggleTaskStatus={toggleTaskStatus} 
            onAddCustomReminder={handleAddCustomReminder}
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

// Export the UI component as default
const Compliance = () => <ComplianceUI />;
export default Compliance;
