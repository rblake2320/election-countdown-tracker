
import { supabase } from '@/integrations/supabase/client'
import { Election, Candidate } from '@/types/election'

export interface DatabaseElection {
  id: string
  office_level: string
  office_name: string
  state: string
  election_dt: string
  is_special: boolean
  party_filter: string[]
  description: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseCandidate {
  id: string
  election_id: string
  name: string
  party: string
  incumbent: boolean
  image_url: string | null
  poll_pct: number
  intent_pct: number
  last_polled: string | null
  created_at: string
  updated_at: string
}

export const electionService = {
  async fetchElections(): Promise<Election[]> {
    try {
      console.log('Fetching elections from database...')
      
      // Fetch elections using type assertion since types aren't updated yet
      const { data: elections, error: electionsError } = await supabase
        .from('elections' as any)
        .select('*')
        .order('election_dt', { ascending: true })

      if (electionsError) {
        console.error('Error fetching elections:', electionsError)
        throw electionsError
      }

      console.log('Elections fetched:', elections?.length || 0)

      // Fetch candidates using type assertion
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates' as any)
        .select('*')
        .order('poll_pct', { ascending: false })

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError)
        throw candidatesError
      }

      console.log('Candidates fetched:', candidates?.length || 0)

      // Group candidates by election
      const candidatesByElection = (candidates as DatabaseCandidate[])?.reduce((acc, candidate) => {
        if (!acc[candidate.election_id]) {
          acc[candidate.election_id] = []
        }
        acc[candidate.election_id].push(candidate)
        return acc
      }, {} as Record<string, DatabaseCandidate[]>) || {}

      // Transform database data to app format
      const transformedElections: Election[] = (elections as DatabaseElection[])?.map(election => ({
        id: election.id,
        title: election.office_name,
        date: election.election_dt,
        type: election.is_special ? 'Special' : election.office_level,
        state: election.state,
        description: election.description || `${election.office_level} election in ${election.state}`,
        candidates: candidatesByElection[election.id]?.map(candidate => ({
          name: candidate.name,
          party: candidate.party,
          pollingPercentage: Math.round(candidate.poll_pct || 0),
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          endorsements: Math.floor(Math.random() * 20)
        })) || [],
        keyRaces: [election.office_name]
      })) || []

      console.log('Transformed elections:', transformedElections.length)
      return transformedElections
    } catch (error) {
      console.error('Error in fetchElections:', error)
      throw error
    }
  },

  async syncFECData(): Promise<void> {
    try {
      console.log('Starting FEC data sync...')
      const { data, error } = await supabase.functions.invoke('fetch-fec-data')
      if (error) throw error
      console.log('FEC data sync completed:', data)
    } catch (error) {
      console.error('Error syncing FEC data:', error)
      throw error
    }
  },

  async syncGoogleCivicData(): Promise<void> {
    try {
      console.log('Starting Google Civic data sync...')
      const { data, error } = await supabase.functions.invoke('fetch-google-civic-data')
      if (error) throw error
      console.log('Google Civic data sync completed:', data)
    } catch (error) {
      console.error('Error syncing Google Civic data:', error)
      throw error
    }
  },

  async syncServerTime(): Promise<number> {
    try {
      console.log('Syncing server time...')
      const { data, error } = await supabase.functions.invoke('sync-time')
      if (error) throw error
      console.log('Server time synced:', data.serverTime)
      return data.serverTime
    } catch (error) {
      console.error('Error syncing server time:', error)
      return Date.now() // Fallback to local time
    }
  }
}
