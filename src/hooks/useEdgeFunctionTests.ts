
import { SystemStatus } from '@/types/diagnostics';
import { invokeWithTimeout } from '@/utils/diagnostics';

export const useEdgeFunctionTests = () => {
  const testEdgeFunctions = async (diagnostics: SystemStatus) => {
    console.log('⚡ Testing edge functions...');

    const functions = [
      { name: 'fetch-fec-data', description: 'FEC Data Ingestion' },
      { name: 'fetch-congress-data', description: 'Congress Data Ingestion' },
      { name: 'fetch-google-civic-data', description: 'Google Civic Data' },
      { name: 'run-all-tests', description: 'Test Suite Runner' },
      { name: 'sync-time', description: 'Time Synchronization' }
    ];

    for (const func of functions) {
      try {
        console.log(`Testing ${func.name}...`);
        
        const { data, error } = await invokeWithTimeout(func.name);

        if (error) {
          if (error.message === 'Timeout') {
            diagnostics.edgeFunctions.push({
              category: 'Edge Functions',
              test: func.description,
              status: 'warning',
              message: 'Function timeout (may be slow)',
              details: { timeout: true }
            });
          } else {
            diagnostics.edgeFunctions.push({
              category: 'Edge Functions',
              test: func.description,
              status: 'fail',
              message: `Function error: ${error.message}`,
              details: error
            });
          }
        } else {
          diagnostics.edgeFunctions.push({
            category: 'Edge Functions',
            test: func.description,
            status: 'pass',
            message: 'Function executed successfully',
            details: data
          });
        }
      } catch (error: any) {
        diagnostics.edgeFunctions.push({
          category: 'Edge Functions',
          test: func.description,
          status: 'fail',
          message: `Function unavailable: ${error.message}`,
          details: error
        });
      }
    }
  };

  return { testEdgeFunctions };
};
