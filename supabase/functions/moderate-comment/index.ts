import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, user_id } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Moderating comment content:', content);

    // Check content with OpenAI moderation
    const moderationResponse = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content,
      }),
    });

    if (!moderationResponse.ok) {
      console.error('OpenAI API error:', moderationResponse.status, moderationResponse.statusText);
      const errorText = await moderationResponse.text();
      console.error('OpenAI error details:', errorText);
      throw new Error(`OpenAI API error: ${moderationResponse.status}`);
    }

    const moderationData = await moderationResponse.json();
    console.log('OpenAI moderation response:', moderationData);
    
    if (!moderationData || !moderationData.results || !moderationData.results[0]) {
      console.error('Invalid moderation response structure:', moderationData);
      // Default to approved if moderation fails
      const flagged = false;
      const categories = {};
      
      console.log('Using default values due to invalid response');
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Insert comment with default approval
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          user_id,
          is_approved: true,
          moderation_status: 'approved',
          moderation_flags: null,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Comment saved with default approval:', data);

      return new Response(JSON.stringify({
        success: true,
        comment: data,
        moderated: false,
        note: 'Moderation service unavailable, comment approved by default'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const flagged = moderationData.results[0].flagged;
    const categories = moderationData.results[0].categories;

    console.log('Moderation result:', { flagged, categories });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert comment with moderation status
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content,
        user_id,
        is_approved: !flagged,
        moderation_status: flagged ? 'rejected' : 'approved',
        moderation_flags: flagged ? Object.keys(categories).filter(key => categories[key]) : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Comment saved:', data);

    return new Response(JSON.stringify({
      success: true,
      comment: data,
      moderated: flagged,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-comment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});