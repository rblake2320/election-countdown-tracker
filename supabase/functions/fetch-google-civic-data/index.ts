
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Google Civic data...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const googleCivicKey = Deno.env.get('GOOGLE_CIVIC_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!googleCivicKey) {
      console.log('Google Civic API key not configured, using mock data');
      
      // Create mock local elections data
      const mockElections = [
        {
          office_level: 'Local',
          office_name: 'Mayor of New York City',
          state: 'NY',
          election_dt: new Date('2025-11-04').toISOString(),
          is_special: false,
          description: 'Mayoral election for New York City'
        },
        {
          office_level: 'Local',
          office_name: 'Los Angeles City Council District 1',
          state: 'CA',
          election_dt: new Date('2025-06-03').toISOString(),
          is_special: false,
          description: 'City council election for LA District 1'
        },
        {
          office_level: 'Local',
          office_name: 'Chicago School Board',
          state: 'IL',
          election_dt: new Date('2025-04-01').toISOString(),
          is_special: false,
          description: 'School board election for Chicago'
        }
      ];

      const { error: mockError } = await supabase
        .from('elections')
        .upsert(mockElections, { 
          onConflict: 'office_name,state,election_dt',
          ignoreDuplicates: true 
        });

      if (mockError) {
        console.error('Error inserting mock elections:', mockError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Mock local elections data created (Google Civic API key not configured)',
          electionsCreated: mockElections.length,
          usingMockData: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Fetch elections with rate limiting protection
    const states = ['CA', 'NY', 'TX', 'FL', 'IL']; // Limit to major states
    const elections = [];
    
    for (const state of states) {
      try {
        // Add delay between requests to avoid rate limiting
        if (elections.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const response = await fetch(
          `https://www.googleapis.com/civicinfo/v2/elections?key=${googleCivicKey}`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (response.status === 429) {
          console.log(`Rate limited for state ${state}, skipping`);
          continue;
        }

        if (!response.ok) {
          console.log(`Error for state ${state}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (data.elections) {
          for (const election of data.elections.slice(0, 3)) { // Limit per state
            elections.push({
              office_level: 'Local',
              office_name: election.name || `Election ${election.id}`,
              state: state,
              election_dt: new Date(election.electionDay || '2025-11-04').toISOString(),
              is_special: false,
              description: `Local election: ${election.name || 'General Election'}`
            });
          }
        }

        // Stop if we have enough elections to avoid rate limits
        if (elections.length >= 10) break;
        
      } catch (error) {
        console.log(`Error fetching data for state ${state}:`, error.message);
        continue;
      }
    }

    // Insert elections if we have any
    if (elections.length > 0) {
      const { error: electionsError } = await supabase
        .from('elections')
        .upsert(elections, { 
          onConflict: 'office_name,state,election_dt',
          ignoreDuplicates: true 
        });

      if (electionsError) {
        console.error('Error inserting Google Civic elections:', electionsError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        electionsCreated: elections.length,
        message: elections.length > 0 ? 'Google Civic data processed successfully' : 'No new elections found'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error fetching Google Civic data:', error)
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
