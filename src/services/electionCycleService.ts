
import { supabase } from '@/integrations/supabase/client';

export interface ElectionCycle {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  type: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const electionCycleService = {
  async getElectionCycles(): Promise<ElectionCycle[]> {
    try {
      console.log('Fetching election cycles...');
      
      const { data, error } = await supabase
        .from('election_cycles')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching election cycles:', error);
        throw error;
      }

      console.log('Election cycles fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getElectionCycles:', error);
      throw error;
    }
  },

  async getActiveElectionCycle(): Promise<ElectionCycle | null> {
    try {
      const { data, error } = await supabase
        .from('election_cycles')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active election cycle:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getActiveElectionCycle:', error);
      return null;
    }
  },

  async getElectionsBycycle(cycleId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('election_cycle_id', cycleId)
        .order('election_dt', { ascending: true });

      if (error) {
        console.error('Error fetching elections by cycle:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getElectionsByycle:', error);
      throw error;
    }
  }
};
