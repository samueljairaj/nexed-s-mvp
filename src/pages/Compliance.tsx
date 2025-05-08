
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertTriangle,
  Calendar,
  Search,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TimelineView } from "@/components/compliance/TimelineView";
import { TaskList } from "@/components/compliance/TaskList";
import { generateMockTasks } from "@/utils/mockTasks";
import { useAICompliance, AITask } from "@/hooks/useAICompliance";

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: "immigration" | "academic" | "employment" | "personal";
  completed: boolean;
  priority: "low" | "medium" | "high";
}

const Compliance = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { generateCompliance, isGenerating } = useAICompliance();
  const [showAiLoading, setShowAiLoading] = useState(false);

  useEffect(() => {
    // Simulate API call to get tasks
    setTimeout(() => {
      const mockTasks = generateMockTasks(currentUser?.visaType || "F1");
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
      setIsLoading(false);
    }, 1000);
  }, [currentUser]);

  // Calculate completion progress
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  // Update tasks status
  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
    
    // Update filtered tasks as well
    setFilteredTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );

    const taskTitle = tasks.find(task => task.id === taskId)?.title;
    const newStatus = !tasks.find(task => task.id === taskId)?.completed;
    
    toast(
      newStatus ? "Task marked as complete" : "Task marked as incomplete", 
      { description: taskTitle }
    );
  };

  // Handle search
  useEffect(() => {
    filterTasks(searchQuery, selectedFilters);
  }, [searchQuery, selectedFilters, tasks]);

  const filterTasks = (query: string, filters: string[]) => {
    let result = [...tasks];
    
    // Apply search query
    if (query) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) || 
        task.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filters
    if (filters.length > 0) {
      result = result.filter(task => filters.includes(task.category));
    }
    
    setFilteredTasks(result);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Generate tasks using AI
  const generateTasksWithAI = async () => {
    setShowAiLoading(true);
    
    try {
      const aiTasks = await generateCompliance();
      
      if (aiTasks && aiTasks.length > 0) {
        setTasks(aiTasks);
        setFilteredTasks(aiTasks);
        toast.success("AI-generated compliance tasks created successfully");
      }
    } catch (error) {
      console.error("Error generating AI tasks:", error);
      toast.error("Failed to generate AI tasks");
    } finally {
      setShowAiLoading(false);
    }
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
        <h1 className="text-3xl font-bold">Compliance Center</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your visa compliance tasks
        </p>
      </header>

      {/* Status Summary Card */}
      <Card className="mb-8 nexed-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Task Progress</h3>
              <div className="flex items-center">
                <div className="w-full mr-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{completionPercentage}% Complete</span>
                    <span>{completedTasks} of {tasks.length} tasks</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Priority Tasks</h3>
              <div className="space-y-1">
                {tasks
                  .filter(task => !task.completed && task.priority === "high")
                  .slice(0, 2)
                  .map(task => (
                    <div key={task.id} className="flex items-center">
                      <AlertTriangle size={16} className="text-red-500 mr-2" />
                      <span className="text-gray-700 truncate">{task.title}</span>
                    </div>
                  ))}
                {tasks.filter(task => !task.completed && task.priority === "high").length === 0 && (
                  <span className="text-gray-500 text-sm italic">No high priority tasks</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Upcoming Deadlines</h3>
              <div className="space-y-1">
                {tasks
                  .filter(task => !task.completed)
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 2)
                  .map(task => (
                    <div key={task.id} className="flex items-center">
                      <Calendar size={16} className="text-nexed-600 mr-2" />
                      <span className="text-gray-700 truncate">{task.title} - {task.dueDate}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
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
          
          {/* AI Task Generation Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateTasksWithAI}
            disabled={isGenerating || showAiLoading}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${(isGenerating || showAiLoading) ? "animate-spin" : ""}`} />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Task Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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

        <TabsContent value="pending">
          <TaskList 
            tasks={filteredTasks.filter(task => !task.completed)} 
            toggleTaskStatus={toggleTaskStatus}
            emptyMessage="No pending tasks"
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <TaskList 
            tasks={filteredTasks.filter(task => {
              const today = new Date();
              const dueDate = new Date(task.dueDate);
              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return !task.completed && diffDays <= 30;
            })} 
            toggleTaskStatus={toggleTaskStatus}
            emptyMessage="No upcoming tasks in the next 30 days"
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
