
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CONGRESS_API_KEY = 'cc9mECbK6VKcz0ChKLUo85xZr6kySbIM9kTiy45M'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching FEC and Congress election data...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch current congressional members to identify incumbents
    const congressResponse = await fetch(
      `https://api.congress.gov/v3/member?api_key=${CONGRESS_API_KEY}&limit=250`
    )
    
    if (!congressResponse.ok) {
      throw new Error(`Congress API error: ${congressResponse.status}`)
    }

    const congressData = await congressResponse.json()
    console.log('Congress members fetched:', congressData.members?.length || 0)

    // Process congressional data to create election entries
    const currentYear = new Date().getFullYear()
    const nextElectionYear = currentYear % 2 === 0 ? currentYear : currentYear + 1

    // Create Senate elections (6-year terms, staggered)
    const senateElections = []
    const houseElections = []

    if (congressData.members) {
      // Group members by state and chamber
      const membersByState = {}
      
      congressData.members.forEach(member => {
        const state = member.state || 'Unknown'
        if (!membersByState[state]) {
          membersByState[state] = { senators: [], representatives: [] }
        }
        
        if (member.terms && member.terms.length > 0) {
          const latestTerm = member.terms[member.terms.length - 1]
          if (latestTerm.chamber === 'Senate') {
            membersByState[state].senators.push({
              ...member,
              termEnd: latestTerm.endYear
            })
          } else if (latestTerm.chamber === 'House of Representatives') {
            membersByState[state].representatives.push(member)
          }
        }
      })

      // Create Senate elections for seats up in the next election
      Object.entries(membersByState).forEach(([state, data]) => {
        data.senators.forEach(senator => {
          // Senate elections occur every 6 years, staggered in classes
          const termEndYear = parseInt(senator.termEnd) || nextElectionYear
          if (termEndYear <= nextElectionYear + 1) {
            const electionDate = new Date(nextElectionYear, 10, 5, 20, 0, 0) // November 5th, 8 PM
            senateElections.push({
              office_level: 'Federal',
              office_name: `U.S. Senate - ${state}`,
              state: state,
              election_dt: electionDate.toISOString(),
              is_special: false,
              description: `U.S. Senate election for ${state}`,
              party_filter: ['Democratic', 'Republican', 'Independent'],
              incumbent_name: `${senator.firstName} ${senator.lastName}`,
              incumbent_party: senator.partyName
            })
          }
        })

        // Create House elections (every 2 years)
        if (data.representatives.length > 0) {
          const electionDate = new Date(nextElectionYear, 10, 5, 20, 0, 0) // November 5th, 8 PM
          houseElections.push({
            office_level: 'Federal',
            office_name: `U.S. House of Representatives - ${state}`,
            state: state,
            election_dt: electionDate.toISOString(),
            is_special: false,
            description: `U.S. House of Representatives elections for ${state}`,
            party_filter: ['Democratic', 'Republican', 'Independent'],
            district_count: data.representatives.length
          })
        }
      })
    }

    // Insert Senate elections
    if (senateElections.length > 0) {
      const { data: insertedSenate, error: senateError } = await supabase
        .from('elections')
        .upsert(senateElections, { 
          onConflict: 'office_name,state',
          ignoreDuplicates: false 
        })

      if (senateError) {
        console.error('Error inserting Senate elections:', senateError)
      } else {
        console.log('Senate elections inserted:', senateElections.length)
      }
    }

    // Insert House elections  
    if (houseElections.length > 0) {
      const { data: insertedHouse, error: houseError } = await supabase
        .from('elections')
        .upsert(houseElections, { 
          onConflict: 'office_name,state',
          ignoreDuplicates: false 
        })

      if (houseError) {
        console.error('Error inserting House elections:', houseError)
      } else {
        console.log('House elections inserted:', houseElections.length)
      }
    }

    // Create candidates for incumbents
    const { data: elections, error: electionsError } = await supabase
      .from('elections')
      .select('id, office_name, state')
      .eq('office_level', 'Federal')

    if (!electionsError && elections) {
      const candidatesToInsert = []

      elections.forEach(election => {
        // Find matching incumbent from Congress data
        const matchingSenator = senateElections.find(se => 
          se.office_name === election.office_name && se.state === election.state
        )

        if (matchingSenator && matchingSenator.incumbent_name) {
          candidatesToInsert.push({
            election_id: election.id,
            name: matchingSenator.incumbent_name,
            party: matchingSenator.incumbent_party || 'Unknown',
            incumbent: true,
            poll_pct: Math.floor(Math.random() * 30) + 35, // Placeholder polling
            intent_pct: 0
          })
        }
      })

      if (candidatesToInsert.length > 0) {
        const { error: candidatesError } = await supabase
          .from('candidates')
          .upsert(candidatesToInsert, { 
            onConflict: 'election_id,name',
            ignoreDuplicates: true 
          })

        if (candidatesError) {
          console.error('Error inserting candidates:', candidatesError)
        } else {
          console.log('Candidates inserted:', candidatesToInsert.length)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        senateElections: senateElections.length,
        houseElections: houseElections.length,
        message: 'Congress election data synced successfully'
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
