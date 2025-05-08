
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
    const { prompt, userData, messageHistory } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Validate required data
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Processing AI assistant request');

    // Prepare message history for context
    const messages = [
      {
        role: 'system',
        content: `You are a specialized immigration assistant for international students and professionals.
        You provide accurate, helpful guidance on visa compliance, requirements, and processes.
        Focus on being informative, practical, and clear. When uncertain, clarify that you're providing
        general guidance and recommend consulting with an immigration attorney or university DSO.
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
