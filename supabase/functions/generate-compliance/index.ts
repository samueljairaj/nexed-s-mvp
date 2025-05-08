import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type VisaType = "F1" | "J1" | "H1B" | "Other";

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

interface RequiredDocument {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  exclude?: boolean;
  phase?: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string | null;
  condition_logic: string;
  required_documents: RequiredDocument[];
  group_name: string;
  priority: number;
  active: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userData } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Validate required data
    if (!userData) {
      throw new Error('User data is required');
    }

    console.log('Generating compliance checklist for:', JSON.stringify(userData));
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Fetch compliance rules from the database - this is now our source of truth
    const { data: rules, error: rulesError } = await supabase
      .from('compliance_rules')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });
      
    if (rulesError) {
      throw new Error(`Failed to fetch compliance rules: ${rulesError.message}`);
    }
    
    console.log(`Fetched ${rules?.length || 0} compliance rules`);
    
    // Process rules against user data to build the checklist
    const rawTasks: RequiredDocument[] = [];
    const processedIds = new Set<string>();
    const excludedTaskIds = new Set<string>();
    
    // First pass: identify excluded tasks
    rules?.forEach((rule: ComplianceRule) => {
      if (matchesConditions(userData, rule.condition_logic)) {
        const documents = rule.required_documents;
        if (documents && Array.isArray(documents)) {
          for (const doc of documents) {
            if (doc.exclude === true) {
              excludedTaskIds.add(doc.id);
            }
          }
        }
      }
    });
    
    console.log(`Excluded task IDs: ${Array.from(excludedTaskIds).join(', ')}`);
    
    // Second pass: collect required tasks
    rules?.forEach((rule: ComplianceRule) => {
      if (matchesConditions(userData, rule.condition_logic)) {
        const documents = rule.required_documents;
        if (documents && Array.isArray(documents)) {
          for (const doc of documents) {
            // Skip excluded and already added tasks
            if (doc.exclude === true || excludedTaskIds.has(doc.id) || processedIds.has(doc.id)) {
              continue;
            }
            
            // Add this document to our checklist
            rawTasks.push({
              ...doc,
              phase: determinePhase(userData, rule.group_name)
            });
            processedIds.add(doc.id);
          }
        }
      }
    });
    
    console.log(`Generated ${rawTasks.length} raw compliance tasks`);
    
    // If we have raw tasks, use OpenAI to refine and explain them (but not to add or remove)
    let enhancedTasks = [];
    
    if (rawTasks.length > 0 && openAIApiKey) {
      enhancedTasks = await refineTasksWithAI(rawTasks, userData, openAIApiKey);
    } else {
      // If no OpenAI, use the raw tasks but calculate due dates
      enhancedTasks = rawTasks.map(doc => {
        const dueDate = calculateDueDate(doc.priority, userData);
        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          dueDate: dueDate,
          category: mapGroupToCategory(doc.phase || "immigration"),
          completed: false,
          priority: doc.priority,
          phase: doc.phase || "general"
        };
      });
    }
    
    // If we still have no tasks but have OpenAI API key, create a fallback message
    if (enhancedTasks.length === 0 && openAIApiKey) {
      console.log("No tasks matched from rules engine, creating fallback message");
      
      const fallbackTask = {
        id: "fallback-1",
        title: "Update your profile for personalized checklist",
        description: "We couldn't generate a personalized checklist with your current profile information. Please update your profile with more details about your visa status, academic information, and employment status.",
        dueDate: calculateDueDate("high", userData),
        category: "personal",
        completed: false,
        priority: "high",
        phase: "general"
      };
      
      enhancedTasks.push(fallbackTask);
    }
    
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

// Helper function to match user data against rule conditions
function matchesConditions(userData: UserData, conditionLogic: string): boolean {
  try {
    const conditions = JSON.parse(conditionLogic);
    return evaluateConditions(userData, conditions);
  } catch (error) {
    console.error('Error parsing condition logic:', error);
    return false;
  }
}

// Function to evaluate complex conditions including operators like $or, $and
function evaluateConditions(userData: UserData, conditions: any): boolean {
  // Handle $or operator
  if (conditions.$or && Array.isArray(conditions.$or)) {
    return conditions.$or.some((subcondition: any) => 
      evaluateConditions(userData, subcondition)
    );
  }
  
  // Handle $and operator
  if (conditions.$and && Array.isArray(conditions.$and)) {
    return conditions.$and.every((subcondition: any) => 
      evaluateConditions(userData, subcondition)
    );
  }
  
  // Handle regular field conditions
  for (const [key, value] of Object.entries(conditions)) {
    if (key === '$or' || key === '$and') continue; // Skip operators, handled above
    
    if (userData[key] === undefined) {
      return false; // If the field doesn't exist in userData, condition fails
    }
    
    if (typeof value === 'string' && typeof userData[key] === 'string') {
      // Case-insensitive string comparison
      if ((userData[key] as string).toLowerCase() !== (value as string).toLowerCase()) {
        return false;
      }
    } else if (userData[key] !== value) {
      return false;
    }
  }
  
  // All conditions matched
  return true;
}

// Helper function to map rule groups to task categories
function mapGroupToCategory(groupName: string): "immigration" | "academic" | "employment" | "personal" {
  const lowerGroup = groupName.toLowerCase();
  
  if (lowerGroup.includes('visa') || 
      lowerGroup === 'f1' || 
      lowerGroup === 'j1' || 
      lowerGroup === 'h1b' ||
      lowerGroup === 'opt' ||
      lowerGroup === 'cpt' ||
      lowerGroup === 'stem opt' ||
      lowerGroup.includes('immigration') ||
      lowerGroup.includes('exclusions')) {
    return "immigration";
  }
  
  if (lowerGroup.includes('university') || 
      lowerGroup.includes('academic') || 
      lowerGroup.includes('transfer') ||
      lowerGroup.includes('education')) {
    return "academic";
  }
  
  if (lowerGroup.includes('employ') || 
      lowerGroup.includes('work') || 
      lowerGroup.includes('job') ||
      lowerGroup === 'opt' ||
      lowerGroup === 'cpt') {
    return "employment";
  }
  
  return "personal";
}

// Determine the visa phase based on user data and rule group
function determinePhase(userData: UserData, groupName: string): string {
  // If the group name already indicates a phase, use it
  const lowerGroup = groupName.toLowerCase();
  if (lowerGroup.includes('cpt')) return 'CPT';
  if (lowerGroup.includes('opt') && lowerGroup.includes('stem')) return 'STEM OPT';
  if (lowerGroup.includes('opt')) return 'OPT';
  if (lowerGroup.includes('h1b')) return 'H1B';
  
  // Otherwise determine from user data
  if (userData.employmentStatus) {
    const status = userData.employmentStatus.toLowerCase();
    if (status.includes('stem')) return 'STEM OPT';
    if (status.includes('opt')) return 'OPT';
    if (status.includes('cpt')) return 'CPT';
    if (status.includes('h1b')) return 'H1B';
  }
  
  if (userData.visaType === 'H1B') return 'H1B';
  if (userData.visaType === 'F1') return 'F1';
  if (userData.visaType === 'J1') return 'J1';
  
  return 'general';
}

// Calculate due date based on priority and user data
function calculateDueDate(priority: string, userData: UserData): string {
  const today = new Date();
  let daysToAdd = 0;
  
  switch (priority) {
    case "high":
      daysToAdd = 7; // High priority: due in 7 days
      break;
    case "medium":
      daysToAdd = 30; // Medium priority: due in 30 days
      break;
    case "low":
      daysToAdd = 90; // Low priority: due in 90 days
      break;
    default:
      daysToAdd = 14; // Default: due in 14 days
  }
  
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + daysToAdd);
  
  return dueDate.toISOString().split('T')[0];
}

// Use AI only to refine and explain existing tasks, not to generate new ones
async function refineTasksWithAI(rawTasks: RequiredDocument[], userData: UserData, openAIApiKey: string): Promise<any[]> {
  try {
    console.log("Using AI to refine task descriptions");
    
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
            content: `You are a specialized immigration compliance assistant. Your role is to ONLY enhance and explain the existing checklist items, not to add or remove any. DO NOT CREATE NEW TASKS.
            
            For each item in the provided checklist:
            1. Keep the original title exactly as is
            2. Enhance the description to make it more clear and helpful
            3. Add a brief explanation of why this document is important
            4. DO NOT add new checklist items
            5. DO NOT remove any existing checklist items
            
            Return the enhanced checklist in the same JSON format as provided.`
          },
          {
            role: 'user',
            content: `Here is information about a user:
            ${JSON.stringify(userData, null, 2)}
            
            And here is their compliance checklist that needs enhancement:
            ${JSON.stringify(rawTasks, null, 2)}
            
            Please enhance the descriptions of these existing items only. Do not add or remove any items.`
          }
        ],
        temperature: 0.5,
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
      // Fall back to raw tasks if AI enhancement fails
      enhancedTasks = rawTasks;
    }
    
    // Make sure we have an array
    if (!Array.isArray(enhancedTasks)) {
      // If AI returned an object with a tasks property
      if (enhancedTasks && Array.isArray(enhancedTasks.tasks)) {
        enhancedTasks = enhancedTasks.tasks;
      } else {
        // Fall back to raw tasks
        enhancedTasks = rawTasks;
      }
    }
    
    // Format the tasks with standard fields
    return enhancedTasks.map((task: any) => {
      // Find the original task to get priority if it wasn't preserved
      const originalTask = rawTasks.find(r => r.id === task.id) || 
                          rawTasks.find(r => r.title === task.title);
      
      const priority = task.priority || (originalTask ? originalTask.priority : "medium");
      const phase = task.phase || (originalTask ? originalTask.phase : "general");
      
      return {
        id: task.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: task.title,
        description: task.description || (originalTask ? originalTask.description : ""),
        dueDate: calculateDueDate(priority, userData),
        category: task.category || mapGroupToCategory(phase),
        completed: false,
        priority: priority,
        phase: phase
      };
    });
  } catch (error) {
    console.error('Error refining tasks with AI:', error);
    
    // Fall back to raw tasks with basic formatting if AI fails
    return rawTasks.map(doc => {
      return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        dueDate: calculateDueDate(doc.priority, userData),
        category: mapGroupToCategory(doc.phase || "immigration"),
        completed: false,
        priority: doc.priority,
        phase: doc.phase || "general"
      };
    });
  }
}
