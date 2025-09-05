import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client using Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // This has admin privileges
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client for JWT verification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Get authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Missing authorization header');
    }

    // Extract JWT token
    const token = authorization.replace('Bearer ', '');

    // Verify the JWT token and get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Parse request body
    const { userId } = await req.json();

    // Security check: ensure the authenticated user can only delete their own account
    if (user.id !== userId) {
      throw new Error('Unauthorized: You can only delete your own account');
    }

    console.log(`🗑️ Deleting user account: ${userId}`);

    // Delete the user using admin privileges
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Successfully deleted user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully' 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Delete user function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});