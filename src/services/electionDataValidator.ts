
import { supabase } from '@/integrations/supabase/client';
import { ElectionDataStatus } from '@/types/electionDataStatus';

export const electionDataValidator = {
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
  }
};
