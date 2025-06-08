
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { STATES } from './constants.ts'
import { generateFederalElections, generateStateElections, generateLocalElections, generateCandidates } from './electionGenerators.ts'
import { insertElectionsInBatches, insertCandidates } from './dataProcessor.ts'
import { ElectionData, ProcessingResult } from './types.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting comprehensive election data creation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const elections: ElectionData[] = [];

    // Generate elections for all states
    for (const state of STATES) {
      elections.push(
        ...generateFederalElections(state),
        ...generateStateElections(state),
        ...generateLocalElections(state)
      );
    }

    console.log(`Created ${elections.length} elections to insert`);

    // Insert elections in batches
    const totalInserted = await insertElectionsInBatches(supabase, elections);

    // Generate and insert candidates
    const candidates = generateCandidates(elections);
    const candidatesInserted = await insertCandidates(supabase, candidates);

    const result: ProcessingResult = {
      success: true,
      electionsCreated: totalInserted,
      candidatesCreated: candidatesInserted,
      message: `Comprehensive election data created: ${totalInserted} elections across all states and territories`
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error creating comprehensive election data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
