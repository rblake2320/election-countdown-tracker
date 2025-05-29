
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
      // Use rpc to query the elections table since it might not be in the generated types yet
      const { data: elections, error: electionsError } = await supabase
        .rpc('get_elections')
        .then(async () => {
          // Fallback to direct query if RPC doesn't exist
          return supabase
            .from('elections' as any)
            .select('*')
            .order('election_dt', { ascending: true })
        })
        .catch(async () => {
          // Direct query as final fallback
          return supabase
            .from('elections' as any)
            .select('*')
            .order('election_dt', { ascending: true })
        })

      if (electionsError) {
        console.error('Error fetching elections:', electionsError)
        throw electionsError
      }

      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates' as any)
        .select('*')
        .order('poll_pct', { ascending: false })

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError)
        throw candidatesError
      }

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
          pollingPercentage: Math.round(candidate.poll_pct),
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          endorsements: Math.floor(Math.random() * 20)
        })) || [],
        keyRaces: [election.office_name]
      })) || []

      return transformedElections
    } catch (error) {
      console.error('Error in fetchElections:', error)
      throw error
    }
  },

  async syncFECData(): Promise<void> {
    try {
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
      const { data, error } = await supabase.functions.invoke('sync-time')
      if (error) throw error
      return data.serverTime
    } catch (error) {
      console.error('Error syncing server time:', error)
      return Date.now() // Fallback to local time
    }
  }
}
