import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentCategory } from '@/types/document';
import { getBaselineChecklist, baselineItemsToAITasks } from '@/utils/baselineChecklists';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateMockTasks } from '@/utils/mockTasks';

// Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  deadline?: Date | null;
  dueDate: string; // Adding dueDate property to solve type issues
  completed: boolean;
  category: DocumentCategory;
  phase?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for custom task creation
interface CustomTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: DocumentCategory;
  phase?: string;
}

export const useComplianceTasks = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<DocumentCategory[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('all_phases');
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [currentUser?.id]);

  // Load user's tasks from local storage or generate baseline if none exist
  const loadTasks = async () => {
    setIsLoading(true);
    
    try {
      // Check local storage for cached tasks
      const cachedTasksJson = localStorage.getItem('compliance_tasks');
      let cachedTasks = null;
      
      if (cachedTasksJson) {
        try {
          const cached = JSON.parse(cachedTasksJson);
          // Validate structure and ensure it has the expected user ID
          if (cached && cached.tasks && cached.userId === currentUser?.id) {
            cachedTasks = cached;
            console.log('Loaded cached tasks from local storage');
          }
        } catch (e) {
          console.error('Error parsing cached tasks:', e);
        }
      }
      
      if (cachedTasks) {
        // Parse dates since JSON.stringify doesn't preserve Date objects
        const parsedTasks = cachedTasks.tasks.map((task: any) => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline) : null,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
        }));
        
        setTasks(parsedTasks);
        if (cachedTasks.lastGeneratedAt) {
          setLastGeneratedAt(new Date(cachedTasks.lastGeneratedAt));
        }
      } else {
        // No cached tasks, load baseline checklist based on user's visa type
        const baselineTasks = baselineItemsToAITasks(
          getBaselineChecklist(currentUser?.visaType || 'F1')
        );
        setTasks(baselineTasks);
        
        // Cache the baseline tasks
        cacheTasksToLocalStorage(baselineTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load compliance tasks');
      
      // Fallback to baseline tasks
      const baselineTasks = baselineItemsToAITasks(
        getBaselineChecklist(currentUser?.visaType || 'F1')
      );
      setTasks(baselineTasks);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cache tasks to localStorage
  const cacheTasksToLocalStorage = (tasksToCache: Task[]) => {
    try {
      localStorage.setItem('compliance_tasks', JSON.stringify({
        userId: currentUser?.id,
        tasks: tasksToCache,
        lastGeneratedAt: lastGeneratedAt?.toISOString()
      }));
    } catch (e) {
      console.error('Error caching tasks to local storage:', e);
    }
  };

  // Generate AI tasks
  const generateTasksWithAI = async () => {
    if (!currentUser) return;
    
    setIsGenerating(true);
    
    try {
      // First show baseline checklist immediately
      const baselineTasks = baselineItemsToAITasks(
        getBaselineChecklist(currentUser.visaType || 'F1')
      );
      setTasks(baselineTasks);
      
      // For quick development and testing, use mock tasks instead of real API call
      // In production, this would be replaced with the actual API call
      const mockTasks = generateMockTasks(currentUser.visaType || 'F1');
      
      // Then enhance with AI tasks - using mock tasks for now
      try {
        const { data, error } = await supabase.functions.invoke('generate-compliance', {
          body: { 
            userId: currentUser.id,
            visaType: currentUser.visaType,
            profile: {
              country: currentUser.country,
              university: currentUser.university,
              // Remove employmentStatus as it doesn't exist in UserProfile
              // employmentStatus: currentUser.employmentStatus
            }
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.tasks) {
          // Transform API response to our task format
          const aiTasks: Task[] = data.tasks.map((task: any, index: number) => ({
            id: `ai-task-${Date.now()}-${index}`,
            title: task.title,
            description: task.description,
            deadline: task.deadline ? new Date(task.deadline) : null,
            dueDate: task.dueDate || (task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '2025-06-30'),
            completed: false,
            category: task.category || 'immigration',
            phase: task.phase || 'general',
            priority: task.priority || 'medium',
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          
          // Update the tasks and cache them
          setTasks(aiTasks);
          setLastGeneratedAt(new Date());
          cacheTasksToLocalStorage(aiTasks);
          
          toast.success('Successfully generated personalized tasks!');
        } else {
          // If no tasks returned, fall back to mock tasks
          setTasks(mockTasks);
          setLastGeneratedAt(new Date());
          cacheTasksToLocalStorage(mockTasks);
          toast.success('Generated tasks based on your profile');
        }
      } catch (apiError) {
        console.error('Error calling AI function, using mock tasks instead:', apiError);
        setTasks(mockTasks);
        setLastGeneratedAt(new Date());
        cacheTasksToLocalStorage(mockTasks);
        toast.success('Generated sample tasks based on your profile');
      }
    } catch (error) {
      console.error('Error generating AI tasks:', error);
      toast.error('Failed to generate personalized tasks');
      
      // Keep the baseline tasks that were already set
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle task status (completed/incomplete)
  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed, updatedAt: new Date() } 
          : task
      );
      
      // Cache the updated tasks
      cacheTasksToLocalStorage(updatedTasks);
      
      return updatedTasks;
    });
  }, []);

  // Add a custom task or reminder
  const addCustomTask = useCallback((taskInput: CustomTaskInput) => {
    const newTask: Task = {
      id: `custom-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskInput.title,
      description: taskInput.description,
      dueDate: taskInput.dueDate,
      deadline: new Date(taskInput.dueDate),
      completed: false,
      category: taskInput.category,
      phase: taskInput.phase || "general",
      priority: taskInput.priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      cacheTasksToLocalStorage(updatedTasks);
      return updatedTasks;
    });
    
    toast.success("Added new reminder");
    return newTask;
  }, []);

  // Toggle category filter
  const toggleFilter = useCallback((category: DocumentCategory) => {
    setSelectedFilters(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  // Filter tasks based on search query, category filters, and phase
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
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
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedFilters.length === 0 || 
      selectedFilters.includes(task.category);
      
    if (matchesSearch && matchesCategory) {
      groups[phase].push(task);
    }
    
    return groups;
  }, {});

  return {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    toggleFilter,
    selectedPhase,
    setSelectedPhase,
    phaseGroups,
    isLoading,
    isGenerating,
    toggleTaskStatus,
    generateTasksWithAI,
    loadTasks,
    addCustomTask,  // Add the new function
  };
};
