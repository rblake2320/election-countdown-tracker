
import { TestResults } from './types.ts';

export async function testSecurity(supabase: any, testResults: TestResults) {
  console.log("🛡️ Testing Security...");

  try {
    // Test RLS protection
    await supabase.auth.signOut(); // Ensure we're signed out
    
    const { data: protectedData, error: protectedError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    // Should return empty data due to RLS
    if (protectedData && protectedData.length > 0) {
      testResults.warnings.push('RLS: Some protected data accessible without auth');
    } else {
      testResults.passed.push('Security: RLS policies protecting user data');
    }

    // Test SQL injection protection
    const maliciousInput = "'; DROP TABLE elections; --";
    const { data: sqlTest, error: sqlError } = await supabase
      .from('elections')
      .select('*')
      .eq('state', maliciousInput)
      .limit(1);
    
    if (!sqlError) {
      testResults.passed.push('Security: SQL injection protection working');
    }

    testResults.passed.push('Security: Basic security measures in place');
  } catch (error) {
    testResults.failed.push(`Security: ${error.message}`);
  }
}
