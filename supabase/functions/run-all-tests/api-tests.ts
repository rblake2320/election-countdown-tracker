
import { TestResults } from './types.ts';

export async function testAPIs(supabase: any, testResults: TestResults) {
  console.log("🌐 Testing External APIs...");

  try {
    // Test sync-time function
    const { data: timeData, error: timeError } = await supabase.functions.invoke('sync-time');
    if (timeError) throw new Error(`Sync-time function failed: ${timeError.message}`);
    if (!timeData || !timeData.serverTime) throw new Error('Invalid time sync response');
    
    testResults.passed.push('Time Sync API: Connected and working');

    // Test data ingestion functions
    const dataFunctions = [
      { name: 'fetch-fec-data', description: 'FEC API integration' },
      { name: 'fetch-google-civic-data', description: 'Google Civic API integration' },
      { name: 'fetch-congress-data', description: 'Congress data integration' }
    ];
    
    for (const func of dataFunctions) {
      try {
        const { data, error } = await supabase.functions.invoke(func.name);
        if (!error && data) {
          testResults.passed.push(`${func.description}: Available and responsive`);
        } else {
          testResults.failed.push(`${func.description}: Not working properly - ${error?.message || 'No data returned'}`);
        }
      } catch (e) {
        testResults.failed.push(`${func.description}: Function not available or configuration issue - ${e.message}`);
      }
    }

  } catch (error) {
    testResults.failed.push(`APIs: ${error.message}`);
  }
}
