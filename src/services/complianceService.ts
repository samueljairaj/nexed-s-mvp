
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/hooks/useComplianceTasks";
import { logDsoAccess } from "@/utils/accessControl";

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
  is_deleted?: boolean;
}

export class ComplianceService {
  static async fetchTasks(userId: string): Promise<Task[]> {
    try {
      // Log DSO access if accessing another user's data
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id !== userId) {
        await logDsoAccess('compliance_tasks', userId);
      }

      const { data, error } = await supabase
        .from('compliance_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('[RLS] Compliance tasks query error:', error);
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Access denied: You do not have permission to view these compliance tasks.');
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
        updated_at: new Date().toISOString(),
        is_deleted: false,
      };

      const { data, error } = await supabase
        .from('compliance_tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('[RLS] Task creation error:', error);
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Access denied: You cannot create compliance tasks for this user.');
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
      const updateData: Partial<ComplianceTask> & { updated_at: string } = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updateData.visa_type) {
        updateData.visa_type = updateData.visa_type as "F1" | "OPT" | "H1B" | "Other";
      }
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
        console.error('[RLS] Task update error:', error);
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Access denied: You cannot update this compliance task.');
        }
        throw error;
      }

      return this.mapTaskFromDB(data);
    } catch (error) {
      console.error('[RLS] Error updating compliance task:', error);
      throw error;
    }
  }

  // SOFT DELETE: Set is_deleted=true
  static async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_tasks')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('[RLS] Task deletion error:', error);
        if (error.message?.toLowerCase().includes('row-level security')) {
          throw new Error('Access denied: You cannot delete this compliance task.');
        }
        throw error;
      }
    } catch (error) {
      console.error('[RLS] Error soft-deleting compliance task:', error);
      throw error;
    }
  }

  // RESTORE: Set is_deleted=false
  static async restoreTask(id: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('compliance_tasks')
        .update({ is_deleted: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[RLS] Task restoration error:', error);
        throw error;
      }
      return this.mapTaskFromDB(data);
    } catch (error) {
      console.error('[RLS] Error restoring compliance task:', error);
      throw error;
    }
  }

  private static mapTaskFromDB(dbTask: ComplianceTask): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      dueDate: dbTask.due_date || '',
      priority: dbTask.priority as TaskPriority,
      category: dbTask.category,
      phase: dbTask.phase,
      completed: dbTask.is_completed,
    };
  }
}
