
import { supabase } from '@/integrations/supabase/client';
import { SystemStatus } from '@/types/diagnostics';
import { invokeWithTimeout } from '@/utils/diagnostics';

export const useDataIngestionTests = () => {
  const testDataIngestion = async (diagnostics: SystemStatus) => {
    console.log('📥 Testing data ingestion process...');

    try {
      // Test if we can trigger data ingestion
      const { data, error } = await invokeWithTimeout('fetch-fec-data');

      if (error) {
        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'FEC Data Trigger',
          status: 'fail',
          message: `Cannot trigger data ingestion: ${error.message}`,
          details: error
        });
      } else {
        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'FEC Data Trigger',
          status: 'pass',
          message: 'Data ingestion triggered successfully',
          details: data
        });

        // Check if new data was actually created
        const { data: afterElections } = await supabase
          .from('elections')
          .select('count', { count: 'exact', head: true });

        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'Data Creation Verification',
          status: 'pass',
          message: `Elections after ingestion: ${afterElections || 0}`,
          details: { count: afterElections }
        });
      }

      // Test data quality
      const { data: recentElections } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentElections && recentElections.length > 0) {
        const hasValidData = recentElections.every(e => 
          e.office_name && e.state && e.election_dt && e.office_level
        );

        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'Data Quality Check',
          status: hasValidData ? 'pass' : 'warning',
          message: hasValidData ? 'All required fields present' : 'Some data quality issues found',
          details: { sampleData: recentElections.slice(0, 3) }
        });
      }

    } catch (error: any) {
      diagnostics.dataIngestion.push({
        category: 'Data Ingestion',
        test: 'Data Ingestion Process',
        status: 'fail',
        message: `Ingestion test failed: ${error.message}`,
        details: error
      });
    }
  };

  return { testDataIngestion };
};
