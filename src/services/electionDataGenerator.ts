
import { supabase } from '@/integrations/supabase/client';
import { ComprehensiveDataResult } from '@/types/electionDataStatus';
import { electionDataValidator } from './electionDataValidator';

export const electionDataGenerator = {
  async ensureComprehensiveData(): Promise<ComprehensiveDataResult> {
    try {
      console.log('🔍 Checking current data status...');
      let dataStatus = await electionDataValidator.verifyDataCompleteness();

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
      dataStatus = await electionDataValidator.verifyDataCompleteness();

      return {
        success: dataStatus.isComprehensive,
        message: dataStatus.isComprehensive 
          ? `Success! Generated comprehensive election data: ${dataStatus.totalElections} total elections`
          : `Partial success. Generated ${dataStatus.totalElections} elections, but still need: ${dataStatus.missingRequirements.join(', ')}`,
        dataStatus
      };
    } catch (error) {
      console.error('Error ensuring comprehensive data:', error);
      const dataStatus = await electionDataValidator.verifyDataCompleteness().catch(() => ({
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
  }
};
