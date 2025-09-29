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
    const body = await req.json();
    const { content, user_id } = body;
    
    // Enhanced input validation
    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content is required and must be a string'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user_id || typeof user_id !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID is required and must be a string'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Content length validation
    const sanitizedContent = content.trim();
    if (sanitizedContent.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Comment cannot be empty'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (sanitizedContent.length > 1000) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Comment exceeds maximum length of 1000 characters'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get auth context for non-system users
    let currentUserId = null;
    if (user_id !== '00000000-0000-0000-0000-000000000000') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Authentication required'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Initialize Supabase client with user context for auth validation
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const userSupabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            authorization: authHeader,
          }
        }
      });

      const { data: { user }, error: authError } = await userSupabase.auth.getUser();
      if (authError || !user || user.id !== user_id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Unauthorized: User can only create comments with their own user_id'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      currentUserId = user.id;
    }
    
    console.log('Processing comment:', { 
      content: sanitizedContent.substring(0, 50) + '...', 
      user_id,
      is_system: user_id === '00000000-0000-0000-0000-000000000000' 
    });

    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Enhanced moderation with multiple validation layers
    const badWords = [
      'mierda', 'puta', 'putas', 'pendejo', 'cerote', 'hijo de puta',
      'cabrón', 'cabron', 'joder', 'coño', 'cojones', 'maricón', 'maricon',
      'idiota', 'imbécil', 'estúpido', 'stupido', 'fuck', 'shit', 'bitch',
      'asshole', 'damn', 'hell', 'spam', 'scam', 'phishing'
    ];

    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{4,}/g, // Repeated characters (5 or more)
      /https?:\/\/[^\s]+/gi, // URLs
      /[A-Z]{10,}/g, // Excessive caps
      /\b\d{10,}\b/g, // Long numbers (potential phone numbers)
    ];

    // Verificar palabras prohibidas
    const containsBadWords = badWords.some(word => 
      sanitizedContent.toLowerCase().includes(word.toLowerCase())
    );

    // Verificar patrones de spam
    const containsSpam = spamPatterns.some(pattern => 
      pattern.test(sanitizedContent)
    );

    // Rate limiting check for non-system users
    if (user_id !== '00000000-0000-0000-0000-000000000000') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentComments, error: countError } = await supabase
        .from('comments')
        .select('id')
        .eq('user_id', user_id)
        .gt('created_at', fiveMinutesAgo);

      if (countError) {
        console.error('Error checking rate limit:', countError);
      } else if (recentComments && recentComments.length >= 5) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Rate limit exceeded: Maximum 5 comments per 5 minutes'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const rejectionReasons = [];
    if (containsBadWords) rejectionReasons.push('inappropriate_language');
    if (containsSpam) rejectionReasons.push('spam_content');

    const isApproved = rejectionReasons.length === 0;
    const moderationStatus = isApproved ? 'approved' : 'rejected';
    const moderationFlags = rejectionReasons.length > 0 ? rejectionReasons : null;

    if (!isApproved) {
      console.log('Comment rejected:', { 
        reasons: rejectionReasons, 
        content_preview: sanitizedContent.substring(0, 50) + '...' 
      });
      
      // Log security event
      console.log('SECURITY_EVENT: Comment moderation rejection', {
        user_id,
        rejection_reasons: rejectionReasons,
        timestamp: new Date().toISOString(),
        content_length: sanitizedContent.length
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Comentario rechazado por contenido inapropiado o spam',
        moderated: true,
        reasons: rejectionReasons
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save approved comments only
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: sanitizedContent,
        user_id: user_id,
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

    console.log('Comment saved successfully:', { 
      id: data.id, 
      user_id: data.user_id,
      is_system: user_id === '00000000-0000-0000-0000-000000000000'
    });

    // Log successful comment creation
    console.log('SECURITY_EVENT: Comment creation success', {
      comment_id: data.id,
      user_id,
      is_system: user_id === '00000000-0000-0000-0000-000000000000',
      timestamp: new Date().toISOString(),
      content_length: sanitizedContent.length
    });

    return new Response(JSON.stringify({
      success: true,
      comment: data,
      moderated: false,
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