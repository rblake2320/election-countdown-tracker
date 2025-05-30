
import { TestResults } from './types.ts';

export async function testErrorHandling(supabase: any, testResults: TestResults) {
  console.log("❌ Testing Error Handling...");

  try {
    // Test invalid table access
    const { data: invalidTable, error: invalidError } = await supabase
      .from('nonexistent_table')
      .select('*');
    
    if (invalidError) {
      testResults.passed.push('Error Handling: Invalid operations properly rejected');
    }

    // Test invalid foreign key
    const { data: invalidFK, error: fkError } = await supabase
      .from('candidates')
      .insert({
        name: 'Test Candidate',
        party: 'Test Party',
        election_id: '00000000-0000-0000-0000-000000000000'
      });
    
    if (fkError) {
      testResults.passed.push('Error Handling: Data integrity constraints working');
    }

  } catch (error) {
    testResults.failed.push(`Error Handling: ${error.message}`);
  }
}
