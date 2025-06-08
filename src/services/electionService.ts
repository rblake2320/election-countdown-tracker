
import { supabase } from '@/integrations/supabase/client'
import { Election, Candidate } from '@/types/election'
import { comprehensiveElectionService } from './comprehensiveElectionService'

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
  async fetchElections(cycleId?: string): Promise<Election[]> {
    try {
      console.log('🔄 Starting comprehensive election fetch...')
      
      // Use the comprehensive service for reliable data loading
      const elections = await comprehensiveElectionService.fetchAllElections();
      
      // Filter by cycle if needed
      if (cycleId) {
        console.log(`🎯 Filtering elections by cycle: ${cycleId}`);
        // For now, return all elections as we don't have cycle filtering implemented
        // TODO: Implement cycle-based filtering when election_cycle_id relationships are established
      }

      console.log(`✅ Successfully loaded ${elections.length} elections for display`);
      return elections;
    } catch (error) {
      console.error('❌ Error in fetchElections:', error);
      throw error;
    }
  },

  async syncFECData(): Promise<void> {
    try {
      console.log('🔄 Starting FEC and Congress data sync...')
      const { data, error } = await supabase.functions.invoke('fetch-fec-data')
      if (error) throw error
      console.log('✅ FEC and Congress data sync completed:', data)
    } catch (error) {
      console.error('❌ Error syncing FEC and Congress data:', error)
      throw error
    }
  },

  async syncCongressData(): Promise<void> {
    try {
      console.log('🔄 Starting detailed Congress data sync...')
      const { data, error } = await supabase.functions.invoke('fetch-congress-data')
      if (error) throw error
      console.log('✅ Congress data sync completed:', data)
    } catch (error) {
      console.error('❌ Error syncing Congress data:', error)
      throw error
    }
  },

  async syncGoogleCivicData(): Promise<void> {
    try {
      console.log('🔄 Starting Google Civic data sync...')
      const { data, error } = await supabase.functions.invoke('fetch-google-civic-data')
      if (error) throw error
      console.log('✅ Google Civic data sync completed:', data)
    } catch (error) {
      console.error('❌ Error syncing Google Civic data:', error)
      throw error
    }
  },

  async syncServerTime(): Promise<number> {
    try {
      console.log('🔄 Syncing server time...')
      const { data, error } = await supabase.functions.invoke('sync-time')
      if (error) throw error
      console.log('✅ Server time synced:', data.serverTime)
      return data.serverTime
    } catch (error) {
      console.error('❌ Error syncing server time:', error)
      return Date.now() // Fallback to local time
    }
  },

  async getDataStatus() {
    return comprehensiveElectionService.verifyDataCompleteness();
  },

  async ensureFullDataset() {
    return comprehensiveElectionService.ensureComprehensiveData();
  }
}
