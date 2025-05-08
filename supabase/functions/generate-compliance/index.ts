
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
}

interface RequiredDocument {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  exclude?: boolean;
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
    
    // Fetch compliance rules from the database
    const { data: rules, error: rulesError } = await supabase
      .from('compliance_rules')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });
      
    if (rulesError) {
      throw new Error(`Failed to fetch compliance rules: ${rulesError.message}`);
    }
    
    console.log(`Fetched ${rules?.length || 0} compliance rules`);
    
    // Process rules against user data
    const tasks: any[] = [];
    const excludedTaskIds = new Set<string>();
    
    // First pass: identify excluded tasks
    rules?.forEach((rule: ComplianceRule) => {
      if (matchesConditions(userData, rule.condition_logic)) {
        const documents = rule.required_documents;
        for (const doc of documents) {
          if (doc.exclude === true) {
            excludedTaskIds.add(doc.id);
          }
        }
      }
    });
    
    console.log(`Excluded task IDs: ${Array.from(excludedTaskIds).join(', ')}`);
    
    // Second pass: collect required tasks
    rules?.forEach((rule: ComplianceRule) => {
      if (matchesConditions(userData, rule.condition_logic)) {
        const documents = rule.required_documents;
        
        for (const doc of documents) {
          // Skip excluded and already added tasks
          if (doc.exclude === true || excludedTaskIds.has(doc.id)) {
            continue;
          }
          
          // Skip if this task is already in our list
          if (tasks.some(task => task.id === doc.id)) {
            continue;
          }
          
          // Calculate due date based on document priority
          const dueDate = calculateDueDate(doc.priority, userData);
          
          tasks.push({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            dueDate: dueDate,
            category: mapGroupToCategory(rule.group_name),
            completed: false,
            priority: doc.priority
          });
        }
      }
    });
    
    console.log(`Generated ${tasks.length} compliance tasks`);
    
    // If we have no tasks from rules but have OpenAI API key, fall back to OpenAI
    if (tasks.length === 0 && openAIApiKey) {
      console.log("No tasks matched from rules engine, falling back to OpenAI");
      
      const aiTasks = await generateTasksWithAI(userData, openAIApiKey);
      return new Response(JSON.stringify({ tasks: aiTasks }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ tasks }), {
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
    
    if (userData[key] !== value) {
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
      lowerGroup === 'stem opt') {
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

// Fallback function to generate tasks using OpenAI if no rules match
async function generateTasksWithAI(userData: UserData, openAIApiKey: string): Promise<any[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a specialized immigration compliance assistant for international students and professionals.
            You help generate personalized compliance checklists based on visa types, academic status, and important dates.
            Provide structured, actionable compliance tasks with due dates, descriptions, and categorize them appropriately.
            Focus on visa requirements, deadlines, document renewals, and reporting obligations.`
          },
          {
            role: 'user',
            content: `Generate a comprehensive compliance checklist for a user with the following information:
            ${JSON.stringify(userData, null, 2)}
            
            Return the response as a JSON array of tasks with these properties:
            - id: string (unique identifier)
            - title: string (clear, concise task name)
            - description: string (detailed explanation)
            - dueDate: string (ISO date string)
            - category: string (one of: "immigration", "academic", "employment", "personal")
            - priority: string (one of: "low", "medium", "high")
            - completed: boolean (default to false)
            
            Base the tasks on their visa type, academic status, and important dates. Include both immediate tasks and future obligations.`
          }
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Failed to generate compliance checklist');
    }

    // Parse the response from OpenAI
    try {
      const responseContent = data.choices[0].message.content;
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                        responseContent.match(/```\n([\s\S]*?)\n```/);
      
      const tasksJson = jsonMatch ? jsonMatch[1] : responseContent;
      const tasks = JSON.parse(tasksJson);
      
      return tasks;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to generate AI compliance checklist');
  }
}
