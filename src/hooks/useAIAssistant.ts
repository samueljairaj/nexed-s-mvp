import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getProfileProperty } from "@/utils/propertyMapping";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ReminderDetails {
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  taskId?: string;
  success?: boolean;
}

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCreatedReminder, setLastCreatedReminder] = useState<ReminderDetails | null>(null);
  const { currentUser } = useAuth();

  const sendMessage = async (prompt: string, messageHistory: Message[] = []) => {
    setIsLoading(true);
    
    try {
      // Prepare message history for context
      const formattedHistory = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Sanitize user data for the AI
      const userData = currentUser ? {
        id: currentUser.id,
        visaType: getProfileProperty(currentUser, 'visa_type'),
        university: currentUser.university,
        country: currentUser.country,
        name: currentUser.name
      } : null;

      console.log('Sending request to AI assistant with user data:', userData ? 'User data available' : 'No user data');

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          prompt, 
          userData, 
          messageHistory: formattedHistory
        }
      });

      if (error) {
        console.error('Error from AI assistant edge function:', error);
        throw new Error(error.message || 'Failed to get response from AI assistant');
      }

      console.log('Received response from AI assistant:', data);

      // Check if a reminder was created
      if (data.reminderCreated && data.reminderDetails) {
        setLastCreatedReminder(data.reminderDetails);
        
        // Show toast notification
        toast.success(`Reminder created: ${data.reminderDetails.title}`, {
          description: `Due date: ${data.reminderDetails.dueDate}`,
          duration: 5000
        });
      } else {
        setLastCreatedReminder(null);
      }

      return {
        id: `msg-${Date.now()}`,
        role: "assistant" as const,
        content: data.response,
        timestamp: data.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      return {
        id: `msg-${Date.now()}`,
        role: "assistant" as const,
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date().toISOString()
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    lastCreatedReminder
  };
}
