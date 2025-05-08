
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useAICompliance } from "@/hooks/useAICompliance";
import { generateMockTasks } from "@/utils/mockTasks";
import { DocumentCategory } from "@/types/document";

// Export the Task type that matches AITask
export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: DocumentCategory;
  completed: boolean;
  priority: "low" | "medium" | "high";
  phase?: string;
};

export const useComplianceTasks = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<DocumentCategory[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { generateCompliance, isGenerating } = useAICompliance();
  const [showAiLoading, setShowAiLoading] = useState(false);
  const [phaseGroups, setPhaseGroups] = useState<{[key: string]: Task[]}>({});

  // Toggle task completion status
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

    // Also update phase groups
    setPhaseGroups(prev => {
      const newGroups = { ...prev };
      
      Object.keys(newGroups).forEach(phase => {
        newGroups[phase] = newGroups[phase].map(task => 
          task.id === taskId 
            ? { ...task, completed: !task.completed } 
            : task
        );
      });
      
      return newGroups;
    });

    const taskTitle = tasks.find(task => task.id === taskId)?.title;
    const newStatus = !tasks.find(task => task.id === taskId)?.completed;
    
    toast(
      newStatus ? "Task marked as complete" : "Task marked as incomplete", 
      { description: taskTitle }
    );
  };

  // Filter tasks based on search, category, and phase
  const filterTasks = (query: string, filters: DocumentCategory[], phase: string) => {
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
    
    // Apply phase filter
    if (phase) {
      result = result.filter(task => task.phase === phase);
    }
    
    setFilteredTasks(result);
  };

  // Toggle category filter
  const toggleFilter = (filter: DocumentCategory) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Generate tasks using AI
  const generateTasksWithAI = async () => {
    setShowAiLoading(true);
    setIsLoading(true);
    
    try {
      const aiTasks = await generateCompliance();
      
      if (aiTasks && aiTasks.length > 0) {
        setTasks(aiTasks as Task[]);
        setFilteredTasks(aiTasks as Task[]);
        
        // Group tasks by phase
        const groupedByPhase = (aiTasks as Task[]).reduce((groups: {[key: string]: Task[]}, task) => {
          const phase = task.phase || "general";
          if (!groups[phase]) {
            groups[phase] = [];
          }
          groups[phase].push(task);
          return groups;
        }, {});
        
        setPhaseGroups(groupedByPhase);
        
        toast.success("AI-generated compliance tasks created successfully");
      } else {
        // Fallback to mock tasks if AI fails or returns empty
        const mockTasks = generateMockTasks(currentUser?.visaType || "F1");
        setTasks(mockTasks);
        setFilteredTasks(mockTasks);
        
        // Group mock tasks by visa type
        const mockGroups = {
          [currentUser?.visaType || "F1"]: mockTasks
        };
        setPhaseGroups(mockGroups);
      }
    } catch (error) {
      console.error("Error generating AI tasks:", error);
      toast.error("Failed to generate AI tasks, using mock data instead");
      
      // Fallback to mock tasks
      const mockTasks = generateMockTasks(currentUser?.visaType || "F1");
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
    } finally {
      setShowAiLoading(false);
      setIsLoading(false);
    }
  };

  // Effect to filter tasks when filters change
  useEffect(() => {
    filterTasks(searchQuery, selectedFilters, selectedPhase);
  }, [searchQuery, selectedFilters, selectedPhase, tasks]);

  // Generate tasks on component mount
  useEffect(() => {
    generateTasksWithAI();
  }, [currentUser]);

  return {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    toggleFilter,
    selectedPhase,
    setSelectedPhase,
    isLoading,
    isGenerating: isGenerating || showAiLoading,
    phaseGroups,
    toggleTaskStatus,
    generateTasksWithAI
  };
};
