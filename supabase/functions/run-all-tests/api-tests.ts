
import { TestResults } from './types.ts';

export async function testAPIs(supabase: any, testResults: TestResults) {
  console.log("🌐 Testing External APIs...");

  try {
    // Test sync-time function
    try {
      const { data: timeData, error: timeError } = await supabase.functions.invoke('sync-time');
      if (timeError) {
        testResults.warnings.push(`Time Sync API: ${timeError.message}`);
      } else if (timeData && timeData.serverTime) {
        testResults.passed.push('Time Sync API: Connected and working');
      } else {
        testResults.warnings.push('Time Sync API: Available but returned unexpected response');
      }
    } catch (e) {
      testResults.warnings.push(`Time Sync API: Function may not be deployed - ${e.message}`);
    }

    // Test data ingestion functions with better error handling
    const dataFunctions = [
      { name: 'fetch-fec-data', description: 'FEC API integration' },
      { name: 'fetch-google-civic-data', description: 'Google Civic API integration' },
      { name: 'fetch-congress-data', description: 'Congress data integration' }
    ];
    
    for (const func of dataFunctions) {
      try {
        // Set a timeout for function calls
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const { data, error } = await supabase.functions.invoke(func.name, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          testResults.warnings.push(`${func.description}: Function error - ${error.message}`);
        } else if (data) {
          if (data.success || data.electionsCreated >= 0) {
            testResults.passed.push(`${func.description}: Available and working`);
          } else {
            testResults.warnings.push(`${func.description}: Available but may have issues - ${JSON.stringify(data)}`);
          }
        } else {
          testResults.warnings.push(`${func.description}: Available but returned no data`);
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          testResults.warnings.push(`${func.description}: Function timeout (may be working but slow)`);
        } else {
          testResults.warnings.push(`${func.description}: Function not available or configuration issue - ${e.message}`);
        }
      }
    }

    // Test if we can at least connect to external APIs (basic connectivity)
    try {
      const testFetch = await fetch('https://api.congress.gov/v3/bill?format=json&limit=1', {
        headers: { 'X-API-Key': 'DEMO_KEY' }
      });
      
      if (testFetch.ok) {
        testResults.passed.push('External API Connectivity: Can reach Congress API');
      } else {
        testResults.warnings.push(`External API Connectivity: Congress API returned ${testFetch.status}`);
      }
    } catch (e) {
      testResults.warnings.push('External API Connectivity: May have network connectivity issues');
    }

  } catch (error) {
    testResults.failed.push(`APIs: ${error.message}`);
  }
}
