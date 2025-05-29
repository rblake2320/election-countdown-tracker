
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

    const googleCivicKey = Deno.env.get('GOOGLE_CIVIC_KEY')
    if (!googleCivicKey) {
      throw new Error('Google Civic API key not configured')
    }

    // Sample addresses to get election data for different states
    const sampleAddresses = [
      'New York, NY',
      'Los Angeles, CA', 
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
      'Philadelphia, PA',
      'San Antonio, TX',
      'San Diego, CA',
      'Dallas, TX',
      'Austin, TX'
    ]

    const electionsToStore = []
    const candidatesToStore = []

    for (const address of sampleAddresses) {
      try {
        // Fetch election data for this address
        const civicUrl = `https://www.googleapis.com/civicinfo/v2/elections?key=${googleCivicKey}`
        const civicResponse = await fetch(civicUrl)
        
        if (!civicResponse.ok) {
          console.log(`Google Civic API error for ${address}: ${civicResponse.status}`)
          continue
        }

        const civicData = await civicResponse.json()
        
        // Fetch voter info for upcoming elections
        for (const election of civicData.elections || []) {
          try {
            const voterInfoUrl = `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${googleCivicKey}&address=${encodeURIComponent(address)}&electionId=${election.id}`
            const voterResponse = await fetch(voterInfoUrl)
            
            if (!voterResponse.ok) {
              console.log(`Voter info error for election ${election.id}: ${voterResponse.status}`)
              continue
            }

            const voterData = await voterResponse.json()
            
            // Process contests (races) in this election
            for (const contest of voterData.contests || []) {
              const electionRecord = {
                id: `${election.id}-${contest.office || contest.referendumTitle || 'contest'}-${crypto.randomUUID()}`,
                office_level: contest.level?.[0] || 'Local',
                office_name: contest.office || contest.referendumTitle || 'Local Contest',
                state: voterData.state?.[0]?.name || 'Unknown',
                election_dt: new Date(election.electionDay).toISOString(),
                is_special: contest.special || false,
                party_filter: [...new Set(contest.candidates?.map(c => c.party) || [])],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              
              electionsToStore.push(electionRecord)

              // Add candidates for this contest
              for (const candidate of contest.candidates || []) {
                const candidateRecord = {
                  id: crypto.randomUUID(),
                  election_id: electionRecord.id,
                  name: candidate.name || 'Unknown Candidate',
                  party: candidate.party || 'Unknown',
                  incumbent: false, // Google Civic doesn't provide incumbent status
                  image_url: candidate.photoUrl || null,
                  poll_pct: Math.random() * 50 + 10, // Mock polling data
                  intent_pct: Math.random() * 100,
                  last_polled: new Date().toISOString()
                }
                candidatesToStore.push(candidateRecord)
              }
            }
          } catch (voterError) {
            console.log(`Error processing voter info for ${address}:`, voterError)
            continue
          }
        }
      } catch (addressError) {
        console.log(`Error processing address ${address}:`, addressError)
        continue
      }
    }

    // Remove duplicates based on office_name and state
    const uniqueElections = electionsToStore.filter((election, index, self) =>
      index === self.findIndex(e => 
        e.office_name === election.office_name && 
        e.state === election.state && 
        e.election_dt === election.election_dt
      )
    )

    // Insert elections data
    if (uniqueElections.length > 0) {
      const { error: electionsError } = await supabaseClient
        .from('elections')
        .upsert(uniqueElections, { onConflict: 'id' })

      if (electionsError) {
        console.error('Error inserting elections:', electionsError)
        throw electionsError
      }

      console.log(`Inserted ${uniqueElections.length} elections from Google Civic`)
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

      console.log(`Inserted ${candidatesToStore.length} candidates from Google Civic`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        electionsCount: uniqueElections.length,
        candidatesCount: candidatesToStore.length,
        message: 'Google Civic data fetched and stored successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in fetch-google-civic-data function:', error)
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
