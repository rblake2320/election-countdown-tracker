
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
    console.log('Fetching detailed Congress data...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch bills from Congress API
    const billsResponse = await fetch('https://api.congress.gov/v3/bill?format=json&limit=50', {
      headers: {
        'X-API-Key': 'DEMO_KEY' // Using demo key to avoid rate limits
      }
    });
    
    const billsData = await billsResponse.json();
    console.log(`Bills fetched: ${billsData.bills?.length || 0}`);

    // Fetch committees
    const committeesResponse = await fetch('https://api.congress.gov/v3/committee?format=json&limit=100', {
      headers: {
        'X-API-Key': 'DEMO_KEY'
      }
    });
    
    const committeesData = await committeesResponse.json();
    console.log(`Committees fetched: ${committeesData.committees?.length || 0}`);

    // Fetch house votes (using smaller limit to avoid rate limits)
    const votesResponse = await fetch('https://api.congress.gov/v3/house/votes?format=json&limit=10', {
      headers: {
        'X-API-Key': 'DEMO_KEY'
      }
    });
    
    let votesData = { votes: [] };
    if (votesResponse.ok) {
      votesData = await votesResponse.json();
    }
    console.log(`House votes fetched: ${votesData.votes?.length || 0}`);

    // Process and create elections from Congress data with proper office_level
    const congressElections = [];
    
    // Create federal elections from bills data
    if (billsData.bills) {
      for (const bill of billsData.bills.slice(0, 5)) { // Limit to prevent too many inserts
        if (bill.title && bill.introducedDate) {
          congressElections.push({
            office_level: 'Federal', // Set proper office_level
            office_name: `${bill.type} ${bill.number} - ${bill.title.substring(0, 100)}`,
            state: 'DC', // Federal bills are handled in DC
            election_dt: new Date(bill.introducedDate).toISOString(),
            is_special: false,
            description: `Congressional bill: ${bill.title}`
          });
        }
      }
    }

    // Insert elections with proper error handling
    if (congressElections.length > 0) {
      const { error: electionsError } = await supabase
        .from('elections')
        .upsert(congressElections, { 
          onConflict: 'office_name,state,election_dt',
          ignoreDuplicates: true 
        });

      if (electionsError) {
        console.error('Error updating elections with Congress data:', electionsError);
        throw electionsError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        billsCount: billsData.bills?.length || 0,
        committeesCount: committeesData.committees?.length || 0,
        votesCount: votesData.votes?.length || 0,
        electionsCreated: congressElections.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error fetching Congress data:', error)
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
