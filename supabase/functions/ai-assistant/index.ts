
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse, addDays, format } from "https://deno.land/x/date_fns@v2.22.1/index.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reminder detection patterns
const reminderPatterns = [
  /remind\s+me\s+to\s+(.+?)(?:\s+on\s+(.+?))?(?:\s+in\s+(.+?))?(?:\s+before\s+(.+?))?(?:\s+by\s+(.+?))?(?:\s*$|\s+with)/i,
  /create\s+(?:a\s+)?(?:reminder|task)\s+(?:to|for)\s+(.+?)(?:\s+on\s+(.+?))?(?:\s+in\s+(.+?))?(?:\s+before\s+(.+?))?(?:\s+by\s+(.+?))?(?:\s*$|\s+with)/i,
  /set\s+(?:a\s+)?(?:reminder|task)\s+(?:to|for)\s+(.+?)(?:\s+on\s+(.+?))?(?:\s+in\s+(.+?))?(?:\s+before\s+(.+?))?(?:\s+by\s+(.+?))?(?:\s*$|\s+with)/i,
];

// Helper function to detect if a prompt contains a reminder request
function detectReminderRequest(prompt: string) {
  for (const pattern of reminderPatterns) {
    if (pattern.test(prompt)) {
      return true;
    }
  }
  return false;
}

// Helper function to extract reminder details from a prompt
function extractReminderDetails(prompt: string) {
  let title = "";
  let dueDate: Date | null = null;
  let priority: "high" | "medium" | "low" = "medium";
  
  // Check for priority indicators
  if (/urgent|important|critical|high priority/i.test(prompt)) {
    priority = "high";
  } else if (/low priority|not urgent|whenever|when you can/i.test(prompt)) {
    priority = "low";
  }
  
  // Try to extract a date
  const datePatterns = [
    { regex: /by\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i, format: 'MMMM d yyyy' },
    { regex: /on\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i, format: 'MMMM d yyyy' },
    { regex: /on\s+(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:,?\s+(\d{4}))?/i, format: 'd MMMM yyyy' },
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i, format: 'MM/dd/yyyy' },
    { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/i, format: 'yyyy-MM-dd' },
  ];

  // Check for relative date expressions
  if (/tomorrow/i.test(prompt)) {
    dueDate = addDays(new Date(), 1);
  } else if (/next week/i.test(prompt)) {
    dueDate = addDays(new Date(), 7);
  } else if (/next month/i.test(prompt)) {
    dueDate = addDays(new Date(), 30);
  } else if (/(in|after)\s+(\d+)\s+(day|days)/i.test(prompt)) {
    const matches = prompt.match(/(in|after)\s+(\d+)\s+(day|days)/i);
    if (matches && matches[2]) {
      const days = parseInt(matches[2], 10);
      dueDate = addDays(new Date(), days);
    }
  } else if (/(\d+)\s+days\s+(before|prior to)/i.test(prompt)) {
    // Handle "X days before" patterns
    const matches = prompt.match(/(\d+)\s+days\s+(before|prior to)\s+(.+)/i);
    if (matches && matches[1] && matches[3]) {
      const days = parseInt(matches[1], 10);
      // We can't determine the exact date without more context, 
      // so we'll use a future date as an approximation
      dueDate = addDays(new Date(), 30 - days);
      title = prompt.replace(matches[0], `${matches[3]} (${days} days before)`);
    }
  } else {
    // Try explicit date patterns
    for (const pattern of datePatterns) {
      const matches = prompt.match(pattern.regex);
      if (matches) {
        let dateStr = "";
        if (pattern.format.includes('MMMM d yyyy')) {
          const year = matches[3] || new Date().getFullYear().toString();
          dateStr = `${matches[1]} ${matches[2]}, ${year}`;
        } else if (pattern.format.includes('d MMMM yyyy')) {
          const year = matches[3] || new Date().getFullYear().toString();
          dateStr = `${matches[1]} ${matches[2]}, ${year}`;
        } else if (pattern.format === 'MM/dd/yyyy') {
          const year = matches[3].length === 2 ? `20${matches[3]}` : matches[3];
          dateStr = `${matches[1]}/${matches[2]}/${year}`;
        } else if (pattern.format === 'yyyy-MM-dd') {
          dateStr = `${matches[1]}-${matches[2]}-${matches[3]}`;
        }
        
        try {
          dueDate = new Date(dateStr);
          if (isNaN(dueDate.getTime())) {
            dueDate = null;
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
        break;
      }
    }
  }

  // Extract title from prompt
  for (const pattern of reminderPatterns) {
    const matches = prompt.match(pattern);
    if (matches && matches[1]) {
      // If we didn't already set the title in a special case above
      if (!title) {
        title = matches[1].trim();
      }
      break;
    }
  }

  return {
    title,
    dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    priority
  };
}

// Helper function to create a task from reminder details
async function createReminder(userId: string, reminderDetails: any, supabaseUrl: string, serviceKey: string) {
  const { title, dueDate, priority } = reminderDetails;
  
  try {
    const taskData = {
      user_id: userId,
      title,
      description: `AI assistant created reminder: ${title}`,
      due_date: dueDate,
      is_completed: false,
      visa_type: null, // We don't have this information from the context
      priority: priority,
      category: "personal",
      phase: "general"
    };

    // Call Supabase to create a compliance task
    const response = await fetch(`${supabaseUrl}/rest/v1/compliance_tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create task: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully created task:', data);
    
    return {
      success: true,
      taskId: data.id,
      message: `Successfully created reminder for "${title}" due on ${dueDate}`
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      success: false,
      message: `Failed to create reminder: ${error.message}`
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userData, messageHistory } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // Validate required data
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Processing AI assistant request');

    // Check if this is a reminder/task creation request
    const isReminderRequest = detectReminderRequest(prompt);
    if (isReminderRequest && userData && userData.id) {
      console.log('Detected reminder creation request');
      
      // Extract reminder details
      const reminderDetails = extractReminderDetails(prompt);
      console.log('Extracted reminder details:', reminderDetails);
      
      if (reminderDetails.title) {
        // Create the reminder in the system
        const reminderResult = await createReminder(
          userData.id,
          reminderDetails,
          supabaseUrl,
          supabaseServiceKey
        );
        
        // Prepare system message with reminder creation result
        let systemMessage = `You are a specialized immigration assistant for international students and professionals.
        You provide accurate, helpful guidance on visa compliance, requirements, and processes.
        Focus on being informative, practical, and clear. When uncertain, clarify that you're providing
        general guidance and recommend consulting with an immigration attorney or university DSO.`;
        
        if (reminderResult.success) {
          systemMessage += `\n\nThe user's reminder "${reminderDetails.title}" has been successfully created and scheduled for ${reminderDetails.dueDate}. 
          Please inform the user that their reminder has been created successfully and confirm the details with them.`;
        } else {
          systemMessage += `\n\nThe system attempted to create a reminder for "${reminderDetails.title}" but encountered an error: 
          ${reminderResult.message}. Please inform the user that there was an issue creating their reminder and suggest they try again or create it manually.`;
        }
        
        // Add user profile context if available
        if (userData) {
          systemMessage += `\n\nUser profile information: ${JSON.stringify(userData, null, 2)}`;
        }
        
        // Prepare message history for context
        const messages = [
          {
            role: 'system',
            content: systemMessage
          }
        ];

        // Add message history if provided
        if (messageHistory && Array.isArray(messageHistory)) {
          messages.push(...messageHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })));
        }

        // Add the current prompt
        messages.push({
          role: 'user',
          content: prompt
        });

        // Call OpenAI API for assistant response
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages,
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
          throw new Error('Failed to generate assistant response');
        }

        return new Response(
          JSON.stringify({ 
            response: data.choices[0].message.content,
            timestamp: new Date().toISOString(),
            reminderCreated: reminderResult.success,
            reminderDetails: {
              ...reminderDetails,
              taskId: reminderResult.taskId,
              success: reminderResult.success
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Standard flow for non-reminder requests or if reminder extraction failed
    // Prepare message history for context
    const messages = [
      {
        role: 'system',
        content: `You are a specialized immigration assistant for international students and professionals.
        You provide accurate, helpful guidance on visa compliance, requirements, and processes.
        Focus on being informative, practical, and clear. When uncertain, clarify that you're providing
        general guidance and recommend consulting with an immigration attorney or university DSO.
        You can also help create reminders by understanding phrases like "remind me to...", "create a reminder to...",
        or "set a task for..." followed by a description and optionally a date.
        ${userData ? `\n\nUser profile information: ${JSON.stringify(userData, null, 2)}` : ''}`
      }
    ];

    // Add message history if provided
    if (messageHistory && Array.isArray(messageHistory)) {
      messages.push(...messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add the current prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    // Call OpenAI API for assistant response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Failed to generate assistant response');
    }

    return new Response(
      JSON.stringify({ 
        response: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
