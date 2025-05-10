import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "sonner";

/**
 * Logs DSO access to student data for audit purposes
 * @param entityType The type of entity being accessed (e.g., 'profile', 'document')
 * @param entityId UUID of the entity being accessed
 */
export const logDsoAccess = async (entityType: string, entityId: string): Promise<void> => {
  try {
    await supabase.rpc('log_dso_data_access', {
      entity_type: entityType,
      entity_id: entityId
    });
  } catch (error) {
    console.error("Failed to log DSO access:", error);
    // Don't show a toast message for this - it's a background operation
  }
};

/**
 * Checks if the current user is a DSO
 * @returns Promise<boolean> true if the user is a DSO
 */
export const checkIsDso = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_dso');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error("Failed to check if user is DSO:", error);
    return false;
  }
};

/**
 * Checks if the specified user is a student at the same university as the DSO
 * @param studentId UUID of the student
 * @returns Promise<boolean> true if the student is at the same university as the DSO
 */
export const checkIsMyStudent = async (studentId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_my_student', {
      student_id: studentId
    });
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error("Failed to check if user is a student:", error);
    return false;
  }
};

/**
 * Fetches audit logs for the current user
 * @param limit Optional limit on number of logs to return
 * @returns Array of audit log entries
 */
export const fetchAuditLogs = async (limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    toast.error("Failed to load access logs");
    return [];
  }
};

/**
 * Helper function to determine if the user has access to a resource
 * @param resourceUserId The user ID associated with the resource
 * @returns Boolean indicating if access is allowed
 */
export const hasAccessToResource = async (resourceUserId: string): Promise<boolean> => {
  try {
    // Check if this is the user's own resource
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // If it's the user's own resource, allow access
    if (user.id === resourceUserId) return true;
    
    // Otherwise, check if the user is a DSO and the resource belongs to one of their students
    const isDso = await checkIsDso();
    if (!isDso) return false;
    
    // If so, log the access and check if the student is at the same university
    return await checkIsMyStudent(resourceUserId);
  } catch (error) {
    console.error("Failed to check resource access:", error);
    return false;
  }
};
