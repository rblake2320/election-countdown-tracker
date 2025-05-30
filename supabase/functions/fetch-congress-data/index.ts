
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
    console.log('Fetching detailed Congress data...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch recent bills that might affect elections
    const billsResponse = await fetch(
      `https://api.congress.gov/v3/bill?api_key=${CONGRESS_API_KEY}&limit=50`
    )
    
    if (!billsResponse.ok) {
      throw new Error(`Congress Bills API error: ${billsResponse.status}`)
    }

    const billsData = await billsResponse.json()
    console.log('Bills fetched:', billsData.bills?.length || 0)

    // Fetch current committee information
    const committeesResponse = await fetch(
      `https://api.congress.gov/v3/committee?api_key=${CONGRESS_API_KEY}&limit=100`
    )
    
    if (!committeesResponse.ok) {
      throw new Error(`Congress Committees API error: ${committeesResponse.status}`)
    }

    const committeesData = await committeesResponse.json()
    console.log('Committees fetched:', committeesData.committees?.length || 0)

    // Fetch recent House votes
    const votesResponse = await fetch(
      `https://api.congress.gov/v3/house-vote?api_key=${CONGRESS_API_KEY}&limit=25`
    )
    
    let votesData = null
    if (votesResponse.ok) {
      votesData = await votesResponse.json()
      console.log('House votes fetched:', votesData.votes?.length || 0)
    }

    // Process and store relevant data
    const insights = {
      recentBills: billsData.bills?.slice(0, 10).map(bill => ({
        title: bill.title,
        type: bill.type,
        introducedDate: bill.introducedDate,
        latestAction: bill.latestAction
      })) || [],
      
      keyCommittees: committeesData.committees?.slice(0, 20).map(committee => ({
        name: committee.name,
        chamber: committee.chamber,
        subcommitteeCount: committee.subcommittees?.length || 0
      })) || [],
      
      recentVotes: votesData?.votes?.slice(0, 10).map(vote => ({
        date: vote.date,
        question: vote.question,
        result: vote.result,
        chamber: 'House'
      })) || []
    }

    // Update elections with additional context from bills and votes
    const { data: elections, error: electionsError } = await supabase
      .from('elections')
      .select('id, office_name, description')
      .eq('office_level', 'Federal')

    if (!electionsError && elections) {
      const updates = elections.map(election => {
        const relevantBills = insights.recentBills.filter(bill => 
          bill.title.toLowerCase().includes('election') || 
          bill.title.toLowerCase().includes('voting') ||
          bill.title.toLowerCase().includes('campaign')
        )

        const enhancedDescription = election.description + 
          (relevantBills.length > 0 ? 
            ` Recent relevant legislation includes ${relevantBills.length} bills affecting elections.` : 
            ''
          )

        return {
          id: election.id,
          description: enhancedDescription
        }
      })

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('elections')
          .upsert(updates, { onConflict: 'id' })

        if (updateError) {
          console.error('Error updating elections with Congress data:', updateError)
        } else {
          console.log('Elections updated with Congress insights')
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        insights,
        message: 'Congress data processed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in fetch-congress-data function:', error)
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
