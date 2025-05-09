
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useAICompliance } from "@/hooks/useAICompliance";
import { generateMockTasks } from "@/utils/mockTasks";
import { DocumentCategory } from "@/types/document";
import { getBaselineChecklist, baselineItemsToAITasks } from "@/utils/baselineChecklists";

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

// Add cache key to localStorage for AI-generated tasks
const AI_TASKS_CACHE_KEY = "nexed_ai_compliance_tasks";

export const useComplianceTasks = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<DocumentCategory[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { generateCompliance, isGenerating } = useAICompliance();
  const [isAILoading, setIsAILoading] = useState(false);
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

    // Also update tasks in cache
    const cachedTasks = JSON.parse(localStorage.getItem(AI_TASKS_CACHE_KEY) || "[]");
    if (cachedTasks.length > 0) {
      const updatedCache = cachedTasks.map((task: Task) => 
        task.id === taskId ? { ...task, completed: newStatus } : task
      );
      localStorage.setItem(AI_TASKS_CACHE_KEY, JSON.stringify(updatedCache));
    }
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

  // Load baseline tasks immediately
  const loadBaselineTasks = () => {
    const visaType = currentUser?.visaType || "F1";
    const mockTasks = generateMockTasks(visaType);
    
    // Try to get cached AI tasks
    const cachedTasks = localStorage.getItem(AI_TASKS_CACHE_KEY);
    
    if (cachedTasks) {
      try {
        const parsedCache = JSON.parse(cachedTasks);
        setTasks(parsedCache);
        setFilteredTasks(parsedCache);
        
        // Group cached tasks by phase
        const groupedByPhase = parsedCache.reduce((groups: {[key: string]: Task[]}, task: Task) => {
          const phase = task.phase || "general";
          if (!groups[phase]) {
            groups[phase] = [];
          }
          groups[phase].push(task);
          return groups;
        }, {});
        
        setPhaseGroups(groupedByPhase);
        toast.success("Loaded your compliance tasks");
      } catch (error) {
        console.error("Error parsing cached tasks:", error);
        setTasksAndGroups(mockTasks);
      }
    } else {
      // Load baseline tasks if no cache
      const baselineItems = getBaselineChecklist(visaType);
      const baselineTasks = baselineItemsToAITasks(baselineItems);
      
      if (baselineTasks.length > 0) {
        setTasksAndGroups(baselineTasks);
      } else {
        // Fallback to mock tasks if baseline is empty
        setTasksAndGroups(mockTasks);
      }
    }
    
    setIsLoading(false);
  };

  // Helper to set tasks and create phase groups
  const setTasksAndGroups = (taskList: Task[]) => {
    setTasks(taskList);
    setFilteredTasks(taskList);
    
    // Group tasks by phase
    const groupedByPhase = taskList.reduce((groups: {[key: string]: Task[]}, task) => {
      const phase = task.phase || "general";
      if (!groups[phase]) {
        groups[phase] = [];
      }
      groups[phase].push(task);
      return groups;
    }, {});
    
    setPhaseGroups(groupedByPhase);
  };

  // Generate tasks using AI - now explicitly triggered by user
  const generateTasksWithAI = async () => {
    setIsAILoading(true);
    
    try {
      const aiTasks = await generateCompliance();
      
      if (aiTasks && aiTasks.length > 0) {
        setTasksAndGroups(aiTasks as Task[]);
        
        // Cache the AI-generated tasks
        localStorage.setItem(AI_TASKS_CACHE_KEY, JSON.stringify(aiTasks));
        
        toast.success("AI-generated compliance tasks created successfully");
      } else {
        toast.error("AI task generation failed, using baseline tasks instead");
        loadBaselineTasks();
      }
    } catch (error) {
      console.error("Error generating AI tasks:", error);
      toast.error("Failed to generate AI tasks");
      loadBaselineTasks();
    } finally {
      setIsAILoading(false);
    }
  };

  // Effect to filter tasks when filters change
  useEffect(() => {
    filterTasks(searchQuery, selectedFilters, selectedPhase);
  }, [searchQuery, selectedFilters, selectedPhase, tasks]);

  // Load baseline tasks on component mount
  useEffect(() => {
    loadBaselineTasks();
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
    isGenerating: isGenerating || isAILoading,
    phaseGroups,
    toggleTaskStatus,
    generateTasksWithAI
  };
};
