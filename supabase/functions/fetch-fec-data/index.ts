
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsOptions, createJsonResponse } from './corsUtils.ts';
import { initializeSupabaseClient } from './supabaseClient.ts';
import { processAllElections } from './electionProcessor.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const supabase = initializeSupabaseClient();
    const result = await processAllElections(supabase);
    
    return createJsonResponse(result, 200);
  } catch (error) {
    console.error('Error creating comprehensive election data:', error);
    
    return createJsonResponse({ 
      error: error.message,
      success: false 
    }, 500);
  }
});
