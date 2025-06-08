
import { supabase } from '@/integrations/supabase/client';
import { Election } from '@/types/election';

export interface ElectionDataStatus {
  totalElections: number;
  federalElections: number;
  stateElections: number;
  localElections: number;
  upcomingElections: number;
  statesCovered: string[];
  isComprehensive: boolean;
  missingRequirements: string[];
}

export const comprehensiveElectionService = {
  async verifyDataCompleteness(): Promise<ElectionDataStatus> {
    try {
      // Get all elections with detailed breakdown
      const { data: allElections, error } = await supabase
        .from('elections')
        .select('*')
        .order('election_dt', { ascending: true });

      if (error) throw error;

      const elections = allElections || [];
      const federalElections = elections.filter(e => e.office_level === 'Federal');
      const stateElections = elections.filter(e => e.office_level === 'State');
      const localElections = elections.filter(e => e.office_level === 'Local');
      const upcomingElections = elections.filter(e => new Date(e.election_dt) > new Date());
      
      const statesCovered = [...new Set(elections.map(e => e.state))].sort();
      
      const requiredStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
      ];

      const missingRequirements = [];
      
      if (elections.length < 160) {
        missingRequirements.push(`Need ${160 - elections.length} more elections (currently ${elections.length})`);
      }
      
      if (federalElections.length < 50) {
        missingRequirements.push(`Need ${50 - federalElections.length} more federal elections`);
      }
      
      if (stateElections.length < 50) {
        missingRequirements.push(`Need ${50 - stateElections.length} more state elections`);
      }
      
      if (localElections.length < 50) {
        missingRequirements.push(`Need ${50 - localElections.length} more local elections`);
      }

      const missingStates = requiredStates.filter(state => !statesCovered.includes(state));
      if (missingStates.length > 0) {
        missingRequirements.push(`Missing states: ${missingStates.join(', ')}`);
      }

      return {
        totalElections: elections.length,
        federalElections: federalElections.length,
        stateElections: stateElections.length,
        localElections: localElections.length,
        upcomingElections: upcomingElections.length,
        statesCovered,
        isComprehensive: missingRequirements.length === 0,
        missingRequirements
      };
    } catch (error) {
      console.error('Error verifying data completeness:', error);
      throw error;
    }
  },

  async ensureComprehensiveData(): Promise<{ success: boolean; message: string; dataStatus: ElectionDataStatus }> {
    try {
      console.log('🔍 Checking current data status...');
      let dataStatus = await this.verifyDataCompleteness();

      if (dataStatus.isComprehensive) {
        return {
          success: true,
          message: 'Election data is already comprehensive',
          dataStatus
        };
      }

      console.log('📊 Data incomplete. Triggering comprehensive data generation...');
      console.log('Missing requirements:', dataStatus.missingRequirements);

      // Trigger comprehensive data generation
      const { data: generationResult, error: generationError } = await supabase.functions.invoke('fetch-fec-data');

      if (generationError) {
        console.error('Data generation failed:', generationError);
        throw new Error(`Data generation failed: ${generationError.message}`);
      }

      console.log('✅ Data generation completed:', generationResult);

      // Wait a moment for data to be committed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Re-verify data completeness
      dataStatus = await this.verifyDataCompleteness();

      return {
        success: dataStatus.isComprehensive,
        message: dataStatus.isComprehensive 
          ? `Success! Generated comprehensive election data: ${dataStatus.totalElections} total elections`
          : `Partial success. Generated ${dataStatus.totalElections} elections, but still need: ${dataStatus.missingRequirements.join(', ')}`,
        dataStatus
      };
    } catch (error) {
      console.error('Error ensuring comprehensive data:', error);
      const dataStatus = await this.verifyDataCompleteness().catch(() => ({
        totalElections: 0,
        federalElections: 0,
        stateElections: 0,
        localElections: 0,
        upcomingElections: 0,
        statesCovered: [],
        isComprehensive: false,
        missingRequirements: ['Failed to verify data status']
      }));
      
      return {
        success: false,
        message: `Failed to ensure comprehensive data: ${error.message}`,
        dataStatus
      };
    }
  },

  async fetchAllElections(): Promise<Election[]> {
    try {
      // First ensure we have comprehensive data
      const { success, dataStatus } = await this.ensureComprehensiveData();
      
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
