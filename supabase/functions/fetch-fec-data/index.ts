
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const fecApiKey = Deno.env.get('FEC_API_KEY')
    if (!fecApiKey) {
      throw new Error('FEC API key not configured')
    }

    // Fetch current election cycle data from FEC
    const currentYear = new Date().getFullYear()
    const electionUrl = `https://api.open.fec.gov/v1/election-dates/?api_key=${fecApiKey}&election_year=${currentYear}&election_year=${currentYear + 1}&sort=-election_date`
    
    console.log('Fetching FEC election data...')
    const fecResponse = await fetch(electionUrl)
    
    if (!fecResponse.ok) {
      throw new Error(`FEC API error: ${fecResponse.status}`)
    }

    const fecData = await fecResponse.json()
    
    // Fetch candidates data
    const candidatesUrl = `https://api.open.fec.gov/v1/candidates/?api_key=${fecApiKey}&election_year=${currentYear}&election_year=${currentYear + 1}&sort=-total_receipts`
    const candidatesResponse = await fetch(candidatesUrl)
    
    if (!candidatesResponse.ok) {
      throw new Error(`FEC Candidates API error: ${candidatesResponse.status}`)
    }

    const candidatesData = await candidatesResponse.json()

    // Process and store election data
    const electionsToStore = []
    const candidatesToStore = []

    // Process FEC election dates
    for (const election of fecData.results || []) {
      const electionRecord = {
        id: crypto.randomUUID(),
        office_level: election.election_type_full?.includes('Primary') ? 'Federal Primary' : 
                    election.election_type_full?.includes('General') ? 'Federal General' : 'Federal',
        office_name: `${election.election_type_full || 'Federal Election'} - ${election.election_state || 'Multiple States'}`,
        state: election.election_state || 'Multiple States',
        election_dt: new Date(election.election_date).toISOString(),
        is_special: election.election_type_full?.includes('Special') || false,
        party_filter: ['Democratic', 'Republican', 'Independent'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      electionsToStore.push(electionRecord)

      // Add relevant candidates for this election
      const relevantCandidates = candidatesData.results?.filter(candidate => 
        candidate.state === election.election_state ||
        (election.election_state === null && candidate.office === 'P') // Presidential candidates for national elections
      ).slice(0, 5) // Limit to top 5 candidates per election

      for (const candidate of relevantCandidates || []) {
        const candidateRecord = {
          id: crypto.randomUUID(),
          election_id: electionRecord.id,
          name: candidate.name || 'Unknown Candidate',
          party: candidate.party_full || candidate.party || 'Unknown',
          incumbent: candidate.incumbent_challenger_full === 'Incumbent',
          image_url: null,
          poll_pct: Math.random() * 50 + 10, // Mock polling data for now
          intent_pct: Math.random() * 100,
          last_polled: new Date().toISOString()
        }
        candidatesToStore.push(candidateRecord)
      }
    }

    // Insert elections data
    if (electionsToStore.length > 0) {
      const { error: electionsError } = await supabaseClient
        .from('elections')
        .upsert(electionsToStore, { onConflict: 'id' })

      if (electionsError) {
        console.error('Error inserting elections:', electionsError)
        throw electionsError
      }

      console.log(`Inserted ${electionsToStore.length} elections`)
    }

    // Insert candidates data
    if (candidatesToStore.length > 0) {
      const { error: candidatesError } = await supabaseClient
        .from('candidates')
        .upsert(candidatesToStore, { onConflict: 'id' })

      if (candidatesError) {
        console.error('Error inserting candidates:', candidatesError)
        throw candidatesError
      }

      console.log(`Inserted ${candidatesToStore.length} candidates`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        electionsCount: electionsToStore.length,
        candidatesCount: candidatesToStore.length,
        message: 'FEC data fetched and stored successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in fetch-fec-data function:', error)
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
