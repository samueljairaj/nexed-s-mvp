
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      {/* Task Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

const TaskList = ({ 
  tasks, 
  toggleTaskStatus,
  emptyMessage
}: { 
  tasks: Task[], 
  toggleTaskStatus: (id: string) => void,
  emptyMessage: string
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card key={task.id} className={`nexed-card ${task.completed ? 'bg-gray-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <Checkbox 
                checked={task.completed} 
                onCheckedChange={() => toggleTaskStatus(task.id)}
                className="mt-1 mr-4"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-medium text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <p className={`mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {task.category}
                    </Badge>
                    <Badge 
                      className={
                        task.priority === "high" ? "bg-red-100 text-red-800 hover:bg-red-100" : 
                        task.priority === "medium" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : 
                        "bg-green-100 text-green-800 hover:bg-green-100"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <span>Due: {task.dueDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Generate mock tasks based on visa type
const generateMockTasks = (visaType: string): Task[] => {
  const commonTasks: Task[] = [
    {
      id: "task-1",
      title: "Update Local Address in SEVIS",
      description: "You must update your address in SEVIS within 10 days of moving to a new location.",
      dueDate: "May 20, 2025",
      category: "immigration",
      completed: false,
      priority: "high"
    },
    {
      id: "task-2",
      title: "Health Insurance Renewal",
      description: "Renew your health insurance policy before it expires to maintain coverage.",
      dueDate: "June 15, 2025",
      category: "personal",
      completed: false,
      priority: "medium"
    },
    {
      id: "task-3",
      title: "Passport Validity Check",
      description: "Ensure your passport is valid for at least 6 months beyond your expected stay.",
      dueDate: "August 30, 2025",
      category: "immigration",
      completed: true,
      priority: "medium"
    },
    {
      id: "task-4",
      title: "Update Emergency Contact Information",
      description: "Keep your emergency contact information up to date with your school.",
      dueDate: "September 5, 2025",
      category: "personal",
      completed: true,
      priority: "low"
    }
  ];

  // Visa-specific tasks
  let specificTasks: Task[] = [];

  if (visaType === "F1") {
    specificTasks = [
      {
        id: "task-f1-1",
        title: "Enroll in Full Course Load",
        description: "Maintain full-time enrollment (min. 12 credits for undergrad, 9 credits for graduate).",
        dueDate: "May 25, 2025",
        category: "academic",
        completed: false,
        priority: "high"
      },
      {
        id: "task-f1-2",
        title: "SEVIS Registration for Fall",
        description: "Your DSO must register you in SEVIS each semester.",
        dueDate: "September 15, 2025",
        category: "immigration",
        completed: false,
        priority: "high"
      },
      {
        id: "task-f1-3",
        title: "Request I-20 Extension",
        description: "If your program will extend beyond your I-20 expiration date, request an extension.",
        dueDate: "October 1, 2025",
        category: "immigration",
        completed: false,
        priority: "medium"
      },
      {
        id: "task-f1-4",
        title: "Verify On-Campus Employment Hours",
        description: "Ensure you're not working more than 20 hours per week during the semester.",
        dueDate: "Recurring",
        category: "employment",
        completed: true,
        priority: "medium"
      }
    ];
  } else if (visaType === "OPT") {
    specificTasks = [
      {
        id: "task-opt-1",
        title: "Submit Employment Updates",
        description: "Report any changes to employment within 10 days to your DSO.",
        dueDate: "Within 10 days of change",
        category: "employment",
        completed: false,
        priority: "high"
      },
      {
        id: "task-opt-2",
        title: "Track Unemployment Days",
        description: "Monitor your unemployment days (max 90 days permitted during OPT).",
        dueDate: "Ongoing",
        category: "employment",
        completed: false,
        priority: "high"
      },
      {
        id: "task-opt-3",
        title: "Submit 6-Month OPT Progress Report",
        description: "File a report on your OPT employment and activities.",
        dueDate: "July 15, 2025",
        category: "employment",
        completed: false,
        priority: "medium"
      },
      {
        id: "task-opt-4",
        title: "Consider STEM OPT Extension",
        description: "Apply for STEM OPT extension 90 days before your current OPT expires (if eligible).",
        dueDate: "November 1, 2025",
        category: "immigration",
        completed: false,
        priority: "medium"
      }
    ];
  } else if (visaType === "H1B") {
    specificTasks = [
      {
        id: "task-h1b-1",
        title: "Verify Employer Records H-1B Compliance",
        description: "Ensure your employer maintains proper Public Access Files for your H-1B.",
        dueDate: "May 30, 2025",
        category: "employment",
        completed: false,
        priority: "medium"
      },
      {
        id: "task-h1b-2",
        title: "Update Address with USCIS",
        description: "File Form AR-11 within 10 days if you change your residence address.",
        dueDate: "Within 10 days of moving",
        category: "immigration",
        completed: false,
        priority: "high"
      },
      {
        id: "task-h1b-3",
        title: "Confirm H-1B Expiration Date",
        description: "Review your H-1B expiration date and prepare for renewal 6 months in advance.",
        dueDate: "June 15, 2025",
        category: "immigration",
        completed: true,
        priority: "medium"
      },
      {
        id: "task-h1b-4",
        title: "Consult Attorney Before Travel",
        description: "Speak with an immigration attorney prior to international travel.",
        dueDate: "Before any travel",
        category: "immigration",
        completed: false,
        priority: "medium"
      }
    ];
  }

  return [...commonTasks, ...specificTasks];
};

export default Compliance;
