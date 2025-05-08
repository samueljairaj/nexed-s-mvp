
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
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
        visaType: currentUser.visaType,
        university: currentUser.university,
        country: currentUser.country
      } : null;

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          prompt, 
          userData, 
          messageHistory: formattedHistory
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response from AI assistant');
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
    isLoading
  };
}
