import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const { guestId } = await req.json();

    if (!guestId) {
      throw new Error("Guest ID is required");
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the guest record to find their user_id
    const { data: guest, error: guestError } = await supabaseAdmin
      .from('guests')
      .select('user_id, name')
      .eq('id', guestId)
      .single();

    if (guestError) {
      console.error("Error fetching guest:", guestError);
      throw new Error("Failed to fetch guest");
    }

    if (!guest.user_id) {
      return new Response(
        JSON.stringify({ message: "Guest has no account to reset" }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete the auth user account
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      guest.user_id
    );

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw new Error("Failed to delete user account");
    }

    // Clear user_id from guest record
    const { error: updateError } = await supabaseAdmin
      .from('guests')
      .update({ user_id: null })
      .eq('id', guestId);

    if (updateError) {
      console.error("Error updating guest:", updateError);
      throw new Error("Failed to update guest record");
    }

    console.log(`Password reset for guest: ${guest.name} (${guestId})`);

    return new Response(
      JSON.stringify({ 
        message: "Password reset successfully. Guest can now create a new password on next login." 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in reset-guest-password function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});