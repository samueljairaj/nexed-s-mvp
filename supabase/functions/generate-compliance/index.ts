import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type VisaType = "F1" | "J1" | "H1B" | "Other";
type DocumentCategory = "immigration" | "education" | "employment" | "personal" | "financial" | "other" | "academic";

interface UserData {
  name?: string;
  email?: string;
  country?: string;
  visaType?: VisaType;
  university?: string;
  courseStartDate?: string;
  usEntryDate?: string;
  employmentStartDate?: string;
  employmentStatus?: string;
  hasTransferred?: boolean;
  fieldOfStudy?: string;
  employer?: string;
  optType?: string;
  graduationDate?: string;
}

interface AITask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: DocumentCategory;
  completed: boolean;
  priority: "low" | "medium" | "high";
  phase?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userData, baselineTasks } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Validate required data
    if (!userData) {
      throw new Error('User data is required');
    }
    
    if (!baselineTasks || !Array.isArray(baselineTasks)) {
      throw new Error('Baseline tasks are required and must be an array');
    }

    console.log('Enhancing compliance checklist for:', JSON.stringify(userData));
    
    // Use AI to enhance the baseline checklist
    const enhancedTasks = await enhanceChecklistWithAI(baselineTasks, userData, openAIApiKey);
    
    return new Response(JSON.stringify({ tasks: enhancedTasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-compliance function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Use AI to enhance the baseline checklist
async function enhanceChecklistWithAI(baselineTasks: AITask[], userData: UserData, openAIApiKey: string): Promise<AITask[]> {
  try {
    console.log("Using AI to enhance baseline checklist");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a specialized immigration compliance assistant. Your task is to:
            1. ENHANCE each baseline checklist item with a clear, concise explanation of why it is required
            2. ADD additional documents or requirements based on the user's profile
            3. DO NOT remove any baseline checklist items
            4. For each new item you add, include an id, title, description, category, priority, and phase
            5. Keep all enhancements factually accurate for visa regulations`
          },
          {
            role: 'user',
            content: `Here is information about a user:
            ${JSON.stringify(userData, null, 2)}
            
            And here is their baseline compliance checklist:
            ${JSON.stringify(baselineTasks, null, 2)}
            
            Given this user profile and baseline checklist, please:
            1. Enhance each item's description to better explain why it's needed
            2. Add any additional documents needed based on their specific situation (e.g., transfers, status changes, employer transitions)
            3. Do not remove any baseline items
            4. Return the complete enhanced checklist`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Failed to enhance compliance checklist with AI');
    }

    // Parse the enhanced tasks
    const responseContent = data.choices[0].message.content;
    let enhancedTasks;
    
    try {
      // Look for a JSON block in the response
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                        responseContent.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        enhancedTasks = JSON.parse(jsonMatch[1]);
      } else {
        // If no JSON block found, try to parse the entire response
        enhancedTasks = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fall back to baseline tasks if AI enhancement fails
      enhancedTasks = baselineTasks;
    }
    
    // Make sure we have an array
    if (!Array.isArray(enhancedTasks)) {
      // If AI returned an object with a tasks property
      if (enhancedTasks && Array.isArray(enhancedTasks.tasks)) {
        enhancedTasks = enhancedTasks.tasks;
      } else {
        // Fall back to baseline tasks
        enhancedTasks = baselineTasks;
      }
    }
    
    // Ensure every task has the required properties
    return enhancedTasks.map((task: any) => {
      // Find matching baseline task if it exists
      const baselineTask = baselineTasks.find(b => b.id === task.id);
      
      // If this is a baseline task, preserve its phase
      const phase = task.phase || (baselineTask ? baselineTask.phase : "general");
      
      return {
        id: task.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate || calculateDueDate(task.priority || "medium"),
        category: task.category || "immigration",
        completed: task.completed || false,
        priority: task.priority || "medium",
        phase: phase
      };
    });
  } catch (error) {
    console.error('Error enhancing checklist with AI:', error);
    // Return the baseline tasks if AI enhancement fails
    return baselineTasks;
  }
}

// Calculate due date based on priority
function calculateDueDate(priority: string): string {
  const today = new Date();
  let daysToAdd = 0;
  
  switch (priority) {
    case "high":
      daysToAdd = 7;
      break;
    case "medium":
      daysToAdd = 30;
      break;
    case "low":
      daysToAdd = 90;
      break;
    default:
      daysToAdd = 14;
  }
  
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + daysToAdd);
  
  return dueDate.toISOString().split('T')[0];
}
