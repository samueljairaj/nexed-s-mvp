
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userData } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Validate required data
    if (!userData) {
      throw new Error('User data is required');
    }

    console.log('Generating compliance checklist for:', JSON.stringify(userData));

    // Call OpenAI API to generate personalized compliance checklist
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
      
      return new Response(JSON.stringify({ tasks }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }
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
