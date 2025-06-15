
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
      const { data, error } = await supabase
        .from('compliance_tasks')
        .insert([{
          ...task,
          user_id: task.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
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
      const { data, error } = await supabase
        .from('compliance_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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

  private static mapTaskFromDB(dbTask: ComplianceTask): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      dueDate: dbTask.due_date || '',
      priority: dbTask.priority,
      category: dbTask.category,
      phase: dbTask.phase,
      completed: dbTask.is_completed,
      visaType: dbTask.visa_type
    };
  }
}
