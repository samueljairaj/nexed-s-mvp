
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts';
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
  isRecurring?: boolean;
  recurringInterval?: string;
}

// Type for database visa types
export type DatabaseVisaType = "F1" | "OPT" | "H1B" | "Other";

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
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);
  const [subscriptionSetup, setSubscriptionSetup] = useState<boolean>(false);

  // Helper function to format dates or provide defaults
  const formatDateOrDefault = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return '2025-06-30'; // Default date
    
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      if (isNaN(date.getTime())) return '2025-06-30'; // Invalid date
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (e) {
      console.error('Error formatting date:', e);
      return '2025-06-30'; // Default fallback
    }
  };

  // Helper function to normalize visa types for database compatibility
  const normalizeVisaType = (visaType: string | undefined): DatabaseVisaType => {
    if (!visaType) return "F1"; // Default to F1 if no visa type
    if (visaType === "F1") return "F1";
    if (visaType === "J1" || visaType === "J-1") return "Other"; 
    if (visaType === "OPT") return "OPT";
    if (visaType === "H1B") return "H1B";
    return "Other";
  };

  // Set up Supabase realtime subscription - FIXED to prevent multiple subscriptions
  useEffect(() => {
    if (!currentUser?.id || subscriptionSetup) return;
    
    // Clean up any existing subscription
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription);
    }

    // Set up a new subscription
    const channel = supabase
      .channel('compliance-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'compliance_tasks',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        console.log('Realtime update received:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          setTasks(prev => {
            // Check if task already exists to avoid duplicates
            if (prev.some(task => task.id === payload.new.id)) {
              return prev;
            }
            
            // Convert database task to our Task format
            const newTask: Task = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description || '',
              deadline: payload.new.due_date ? new Date(payload.new.due_date) : null,
              dueDate: payload.new.due_date || '2025-06-30',
              completed: payload.new.is_completed || false,
              category: payload.new.category as DocumentCategory,
              phase: payload.new.phase || 'general',
              priority: payload.new.priority || 'medium',
              createdAt: payload.new.created_at ? new Date(payload.new.created_at) : new Date(),
              updatedAt: payload.new.updated_at ? new Date(payload.new.updated_at) : new Date(),
              isRecurring: payload.new.is_recurring || false,
              recurringInterval: payload.new.recurring_interval
            };
            
            return [...prev, newTask];
          });
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(task => {
            if (task.id === payload.new.id) {
              return {
                ...task,
                title: payload.new.title,
                description: payload.new.description || task.description,
                deadline: payload.new.due_date ? new Date(payload.new.due_date) : task.deadline,
                dueDate: payload.new.due_date || task.dueDate,
                completed: payload.new.is_completed,
                category: payload.new.category as DocumentCategory || task.category,
                phase: payload.new.phase || task.phase,
                priority: payload.new.priority || task.priority,
                updatedAt: new Date(),
                isRecurring: payload.new.is_recurring || task.isRecurring,
                recurringInterval: payload.new.recurring_interval || task.recurringInterval
              };
            }
            return task;
          }));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(task => task.id !== payload.old.id));
        }
      })
      .subscribe();

    setRealtimeSubscription(channel);
    setSubscriptionSetup(true);

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, subscriptionSetup]);

  // Load tasks on component mount - FIXED to prevent infinite loops
  useEffect(() => {
    if (currentUser?.id) {
      loadTasks();
    }
  }, [currentUser?.id]);

  // New function to save tasks to the database with proper date handling
  const saveTasksToDatabase = async (tasksToSave: Task[]) => {
    if (!currentUser?.id) return;
    
    try {
      // Transform tasks to Supabase format with proper date handling
      const supabaseTasks = tasksToSave.map(task => ({
        user_id: currentUser.id,
        title: task.title,
        description: task.description,
        due_date: formatDateOrDefault(task.dueDate),
        is_completed: task.completed,
        category: task.category,
        phase: task.phase || 'general',
        priority: task.priority,
        visa_type: normalizeVisaType(currentUser.visaType),
        is_recurring: task.isRecurring || false,
        recurring_interval: task.recurringInterval
      }));
      
      // First delete existing tasks
      const { error: deleteError } = await supabase
        .from('compliance_tasks')
        .delete()
        .eq('user_id', currentUser.id);
        
      if (deleteError) {
        console.error('Error deleting existing tasks:', deleteError);
        throw deleteError;
      }
      
      // Then insert new tasks
      const { data, error } = await supabase
        .from('compliance_tasks')
        .insert(supabaseTasks)
        .select();
        
      if (error) {
        console.error('Error saving tasks to database:', error);
        throw error;
      }
      
      console.log('Saved tasks to database:', data);
      return data;
    } catch (error) {
      console.error('Failed to save tasks to database:', error);
      // Continue with local storage as fallback
    }
  };

  // Function to load tasks from the database
  const loadTasksFromDatabase = async () => {
    if (!currentUser?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('compliance_tasks')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error('Error loading tasks from database:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // Transform database format to our Task format
        return data.map((dbTask: any) => ({
          id: dbTask.id,
          title: dbTask.title,
          description: dbTask.description || '',
          deadline: dbTask.due_date ? new Date(dbTask.due_date) : null,
          dueDate: dbTask.due_date || '2025-06-30',
          completed: dbTask.is_completed || false,
          category: dbTask.category as DocumentCategory,
          phase: dbTask.phase || 'general',
          priority: dbTask.priority || 'medium',
          createdAt: dbTask.created_at ? new Date(dbTask.created_at) : new Date(),
          updatedAt: dbTask.updated_at ? new Date(dbTask.updated_at) : new Date(),
          isRecurring: dbTask.is_recurring || false,
          recurringInterval: dbTask.recurring_interval
        }));
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load tasks from database:', error);
      return null;
    }
  };

  // Load user's tasks from database first, then local storage if needed
  const loadTasks = async () => {
    setIsLoading(true);

    try {
      // First try to load from database
      const dbTasks = await loadTasksFromDatabase();

      if (dbTasks && dbTasks.length > 0) {
        console.log('Loaded tasks from database:', dbTasks.length);
        setTasks(dbTasks);
        setLastGeneratedAt(new Date());

        // Update local storage with the latest from database
        cacheTasksToLocalStorage(dbTasks);
      } else {
        // Fallback to local storage
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

          // Save the cached tasks to database for future use
          await saveTasksToDatabase(parsedTasks);
        } else {
          // No cached tasks, generate mock tasks immediately
          const mockTasks = generateMockTasks(currentUser?.visaType || 'F1');
          setTasks(mockTasks);
          setLastGeneratedAt(new Date());

          // Save mock tasks to database and local storage
          await saveTasksToDatabase(mockTasks);
          cacheTasksToLocalStorage(mockTasks);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load compliance tasks');

      // Fallback to mock tasks
      const mockTasks = generateMockTasks(currentUser?.visaType || 'F1');
      setTasks(mockTasks);
      cacheTasksToLocalStorage(mockTasks);
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

  // Generate AI tasks with proper date handling
  const generateTasksWithAI = async () => {
    if (!currentUser) return;
    
    setIsGenerating(true);
    
    try {
      // First show baseline checklist immediately
      const baselineTasks = baselineItemsToAITasks(
        getBaselineChecklist(currentUser.visaType || 'F1')
      );
      setTasks(baselineTasks);
      
      // Then enhance with AI tasks or fallback to mock tasks
      try {
        // For now, use mock tasks to ensure we have data
        const mockTasks = generateMockTasks(currentUser.visaType || 'F1');
        setTasks(mockTasks);
        setLastGeneratedAt(new Date());
        
        // Save to database and local storage with proper date handling
        await saveTasksToDatabase(mockTasks);
        cacheTasksToLocalStorage(mockTasks);
        toast.success('Generated tasks based on your profile');
      } catch (apiError) {
        console.error('Error generating tasks, using mock tasks instead:', apiError);
        const mockTasks = generateMockTasks(currentUser.visaType || 'F1');
        setTasks(mockTasks);
        setLastGeneratedAt(new Date());
        
        // Save mock tasks to database and local storage with proper date handling
        await saveTasksToDatabase(mockTasks);
        cacheTasksToLocalStorage(mockTasks);
        toast.success('Generated sample tasks based on your profile');
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error('Failed to generate personalized tasks');
      
      // Keep the baseline tasks that were already set
    } finally {
      setIsGenerating(false);
    }
  };

  // Update task in database when toggled
  const updateTaskInDatabase = async (taskId: string, isCompleted: boolean) => {
    if (!currentUser?.id) return;
    
    try {
      const { error } = await supabase
        .from('compliance_tasks')
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error('Error updating task in database:', error);
      }
    } catch (error) {
      console.error('Failed to update task in database:', error);
    }
  };

  // Toggle task status (completed/incomplete)
  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === taskId) {
          const completed = !task.completed;
          // Update task in database
          updateTaskInDatabase(taskId, completed);
          
          return { ...task, completed, updatedAt: new Date() };
        }
        return task;
      });
      
      // Cache the updated tasks
      cacheTasksToLocalStorage(updatedTasks);
      
      return updatedTasks;
    });
  }, [currentUser?.id]);

  // Add a custom task to database and local state
  const addCustomTaskToDatabase = async (task: Task) => {
    if (!currentUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('compliance_tasks')
        .insert({
          user_id: currentUser.id,
          title: task.title,
          description: task.description,
          due_date: formatDateOrDefault(task.dueDate),
          is_completed: task.completed,
          category: task.category,
          phase: task.phase || 'general',
          priority: task.priority,
          visa_type: normalizeVisaType(currentUser.visaType),
          is_recurring: task.isRecurring || false,
          recurring_interval: task.recurringInterval
        })
        .select();
        
      if (error) {
        console.error('Error adding custom task to database:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // Return the newly created task with the database ID
        return {
          ...task,
          id: data[0].id
        };
      }
      
      return task;
    } catch (error) {
      console.error('Failed to add custom task to database:', error);
      return task;
    }
  };

  // Add a custom task or reminder
  const addCustomTask = useCallback(async (taskInput: CustomTaskInput) => {
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
    
    try {
      // Add to database first to get the proper ID
      const dbTask = await addCustomTaskToDatabase(newTask);
      
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, dbTask];
        cacheTasksToLocalStorage(updatedTasks);
        return updatedTasks;
      });
      
      toast.success("Added new reminder");
      return dbTask;
    } catch (error) {
      // Fallback to just adding to local state if database fails
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, newTask];
        cacheTasksToLocalStorage(updatedTasks);
        return updatedTasks;
      });
      
      toast.success("Added new reminder");
      return newTask;
    }
  }, [currentUser?.id]);

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
    addCustomTask,
  };
};
