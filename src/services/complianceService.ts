import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/hooks/useComplianceTasks";

// Update to match new enum type
export type TaskPriority = "low" | "medium" | "high";

export interface ComplianceTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: TaskPriority;
  category: string;
  phase: string;
  is_completed: boolean;
  visa_type?: string;
  created_at: string;
  updated_at: string;
}

export class ComplianceService {
  static async fetchTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Permission denied: You do not have access to these compliance tasks.');
        }
        throw error;
      }

      return (data || []).map(this.mapTaskFromDB);
    } catch (error) {
      console.error('[RLS] Error fetching compliance tasks:', error);
      throw error;
    }
  }

  static async createTask(task: Partial<ComplianceTask>): Promise<Task> {
    try {
      const taskData = {
        user_id: task.user_id!,
        title: task.title!,
        description: task.description || '',
        due_date: task.due_date,
        priority: (task.priority || 'medium') as TaskPriority,
        category: task.category || 'personal',
        phase: task.phase || 'general',
        is_completed: task.is_completed || false,
        visa_type: task.visa_type as "F1" | "OPT" | "H1B" | "Other" | null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('compliance_tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Permission denied: You cannot create new compliance tasks.');
        }
        throw error;
      }

      return this.mapTaskFromDB(data);
    } catch (error) {
      console.error('[RLS] Error creating compliance task:', error);
      throw error;
    }
  }

  static async updateTask(id: string, updates: Partial<ComplianceTask>): Promise<Task> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Ensure visa_type is properly typed if provided
      if (updateData.visa_type) {
        updateData.visa_type = updateData.visa_type as "F1" | "OPT" | "H1B" | "Other";
      }
      // Ensure priority updates use the DB enum values
      if (updateData.priority) {
        updateData.priority = updateData.priority as TaskPriority;
      }

      const { data, error } = await supabase
        .from('compliance_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Permission denied: You cannot update this compliance task.');
        }
        throw error;
      }

      return this.mapTaskFromDB(data);
    } catch (error) {
      console.error('[RLS] Error updating compliance task:', error);
      throw error;
    }
  }

  static async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Permission denied: You cannot delete this compliance task.');
        }
        throw error;
      }
    } catch (error) {
      console.error('[RLS] Error deleting compliance task:', error);
      throw error;
    }
  }

  private static mapTaskFromDB(dbTask: any): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      dueDate: dbTask.due_date || '',
      priority: dbTask.priority as TaskPriority,
      category: dbTask.category,
      phase: dbTask.phase,
      completed: dbTask.is_completed
    };
  }
}
