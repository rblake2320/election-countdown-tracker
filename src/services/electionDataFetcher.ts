
import { supabase } from '@/integrations/supabase/client';
import { Election } from '@/types/election';
import { electionDataGenerator } from './electionDataGenerator';

export const electionDataFetcher = {
  async fetchAllElections(): Promise<Election[]> {
    try {
      // First ensure we have comprehensive data
      const { success, dataStatus } = await electionDataGenerator.ensureComprehensiveData();
      
      if (!success && dataStatus.totalElections < 100) {
        console.warn('⚠️ Insufficient election data detected. Attempting to generate more...');
        // Try generating data again if we have very few elections
        await supabase.functions.invoke('fetch-fec-data');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log('📊 Fetching all elections from database...');
      
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('election_dt', { ascending: true });

      if (electionsError) {
        console.error('Error fetching elections:', electionsError);
        throw electionsError;
      }

      // Fetch all candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .order('poll_pct', { ascending: false });

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError);
        // Don't throw here, continue without candidate data
      }

      const elections = electionsData || [];
      const candidates = candidatesData || [];

      console.log(`📈 Loaded ${elections.length} elections and ${candidates.length} candidates`);

      // Group candidates by election
      const candidatesByElection = candidates.reduce((acc, candidate) => {
        if (!acc[candidate.election_id]) {
          acc[candidate.election_id] = [];
        }
        acc[candidate.election_id].push(candidate);
        return acc;
      }, {} as Record<string, typeof candidates[0][]>);

      // Transform to app format
      const transformedElections: Election[] = elections.map(election => ({
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
      }));

      console.log(`🎯 Transformed ${transformedElections.length} elections for display`);
      
      if (transformedElections.length < 160) {
        console.warn(`⚠️ Only ${transformedElections.length} elections available. Expected 160+`);
      }

      return transformedElections;
    } catch (error) {
      console.error('Error in fetchAllElections:', error);
      throw error;
    }
  }
};
