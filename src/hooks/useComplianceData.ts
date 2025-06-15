
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Task } from "@/hooks/useComplianceTasks";
import { ComplianceService } from "@/services/complianceService";
import { toast } from "sonner";

export function useComplianceData() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }
    fetchTasks();
  }, [currentUser?.id]);

  const fetchTasks = async () => {
    if (!currentUser?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await ComplianceService.fetchTasks(currentUser.id);
      setTasks(fetchedTasks);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to fetch tasks";
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const updatedTask = await ComplianceService.updateTask(taskId, {
        is_completed: !task.completed,
      });

      setTasks(prev =>
        prev.map(t => t.id === taskId ? updatedTask : t)
      );

      toast.success(
        updatedTask.completed ? 'Task marked as completed' : 'Task marked as pending'
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to update task";
      console.error('Error updating task:', err);
      toast.error(errorMessage);
    }
  };

  const addCustomTask = async (title: string, dueDate: string, priority: "low" | "medium" | "high") => {
    if (!currentUser?.id) return;

    try {
      const newTask = await ComplianceService.createTask({
        user_id: currentUser.id,
        title,
        due_date: dueDate,
        priority, // now guaranteed to be TaskPriority enum
        category: "personal",
        phase: "general",
        is_completed: false
      });

      setTasks(prev => [...prev, newTask]);
      toast.success('Custom task added successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to add custom task";
      console.error('Error adding custom task:', err);
      toast.error(errorMessage);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await ComplianceService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to delete task";
      console.error('Error deleting task:', err);
      toast.error(errorMessage);
    }
  };

  const refreshTasks = () => {
    fetchTasks();
  };

  return {
    tasks,
    isLoading,
    error,
    toggleTaskStatus,
    addCustomTask,
    deleteTask,
    refreshTasks
  };
}

