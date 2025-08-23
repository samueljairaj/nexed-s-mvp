import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [realtimeSubscription, setRealtimeSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const { currentUser } = useAuth();

  // Set up Supabase realtime subscription for messages
  useEffect(() => {
    if (!currentUser?.id) return;

    // Clean up any existing subscription
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }

    // Set up a new subscription for a hypothetical messages table
    // Note: You would need to create this table in your Supabase database
    const subscription = supabase
      .channel('assistant-messages-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assistant_messages',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        console.log('Realtime message update received:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            if (prev.some(msg => msg.id === payload.new.id)) {
              return prev;
            }
            
            // Convert database message to our Message format and ensure role is correctly typed
            const newMessage: Message = {
              id: payload.new.id,
              role: payload.new.role === "user" || payload.new.role === "assistant" 
                ? payload.new.role 
                : "assistant", // Default to assistant if invalid role
              content: payload.new.content,
              timestamp: payload.new.created_at
            };
            
            return [...prev, newMessage];
          });
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      })
      .subscribe();

    setRealtimeSubscription(subscription);

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id]);

  // Load message history from Supabase
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUser?.id) return;
      
      try {
        // This assumes you have an assistant_messages table
        // If you don't, you'll need to create it
        const { data, error } = await supabase
          .from('assistant_messages')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            // Ensure role is correctly typed as "user" | "assistant"
            role: msg.role === "user" || msg.role === "assistant" 
              ? msg.role as "user" | "assistant" 
              : "assistant", // Default to assistant if invalid role
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          
          setMessages(formattedMessages);
        } else if (messages.length === 0) {
          // Add a welcome message if no messages exist
          const welcomeMessage: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `👋 Hello${currentUser?.name ? ` ${currentUser.name}` : ''}! I'm your immigration assistant. How can I help you with your ${currentUser?.visaType || "visa"}-related questions today?\n\nYou can also ask me to create reminders for important tasks by saying something like "remind me to renew my I-20 in 30 days" or "create a task to submit my OPT progress report by April 15".`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages([welcomeMessage]);
          
          // Save welcome message to database
          saveMessageToDatabase(welcomeMessage);
        }
      } catch (error) {
        console.error('Error loading message history:', error);
      }
    };
    
    loadMessages();
  }, [currentUser?.id, currentUser?.name, currentUser?.visaType, saveMessageToDatabase]);

  // Save message to Supabase
  const saveMessageToDatabase = useCallback(async (message: Message) => {
    if (!currentUser?.id) return;
    
    try {
      // This assumes you have an assistant_messages table
      // If you don't, you'll need to create it
      const { error } = await supabase
        .from('assistant_messages')
        .insert({
          id: message.id,
          role: message.role,
          content: message.content,
          user_id: currentUser.id,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  }, [currentUser?.id]);

  const sendMessage = async (prompt: string, messageHistory: Message[] = []) => {
    setIsLoading(true);
    
    try {
      // Create and save user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Save user message to database
      await saveMessageToDatabase(userMessage);
      
      // Prepare message history for context
      const formattedHistory = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Sanitize user data for the AI
      const userData = currentUser ? {
        id: currentUser.id,
        visaType: currentUser.visaType,
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

      // Create assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Save assistant message to database
      await saveMessageToDatabase(assistantMessage);

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

      return assistantMessage;
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Save error message to database
      await saveMessageToDatabase(errorMessage);
      
      return errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    lastCreatedReminder,
    messages,
    setMessages
  };
}
