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
    
    console.log('Processing comment:', { content, user_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lista de palabras prohibidas
    const badWords = [
      'mierda', 'puta', 'putas', 'pendejo', 'cerote', 'hijo de puta',
      'cabrón', 'cabron', 'joder', 'coño', 'cojones', 'maricón', 'maricon',
      'idiota', 'imbécil', 'estúpido', 'stupido', 'fuck', 'shit', 'bitch',
      'asshole', 'damn', 'hell'
    ];

    // Verificar si el contenido contiene palabras prohibidas
    const containsBadWords = badWords.some(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );

    const isApproved = !containsBadWords;
    const moderationStatus = containsBadWords ? 'rejected' : 'approved';
    const moderationFlags = containsBadWords ? ['inappropriate_language'] : null;

    if (containsBadWords) {
      console.log('Comment rejected due to inappropriate content:', content);
      return new Response(JSON.stringify({
        success: false,
        error: 'Comentario rechazado por contenido inapropiado',
        moderated: true,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Solo guardar comentarios aprobados
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content,
        user_id,
        is_approved: isApproved,
        moderation_status: moderationStatus,
        moderation_flags: moderationFlags,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Comment saved successfully:', data);

    return new Response(JSON.stringify({
      success: true,
      comment: data,
      moderated: false,
      note: 'Comment approved (moderation temporarily disabled)',
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