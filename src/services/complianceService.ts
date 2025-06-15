
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/hooks/useComplianceTasks";

export interface ComplianceTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: "low" | "medium" | "high";
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

      if (error) throw error;

      return (data || []).map(this.mapTaskFromDB);
    } catch (error) {
      console.error('Error fetching compliance tasks:', error);
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
        priority: task.priority || 'medium',
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

      if (error) throw error;

      return this.mapTaskFromDB(data);
    } catch (error) {
      console.error('Error creating compliance task:', error);
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

      const { data, error } = await supabase
        .from('compliance_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapTaskFromDB(data);
    } catch (error) {
      console.error('Error updating compliance task:', error);
      throw error;
    }
  }

  static async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting compliance task:', error);
      throw error;
    }
  }

  private static mapTaskFromDB(dbTask: any): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      dueDate: dbTask.due_date || '',
      priority: dbTask.priority as "low" | "medium" | "high",
      category: dbTask.category,
      phase: dbTask.phase,
      completed: dbTask.is_completed,
      visaType: dbTask.visa_type
    };
  }
}
