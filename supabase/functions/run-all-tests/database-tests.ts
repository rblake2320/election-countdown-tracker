
import { TestResults } from './types.ts';

export async function testDatabase(supabase: any, testResults: TestResults) {
  console.log("📊 Testing Database...");

  try {
    // Test each critical table
    const tables = [
      'profiles', 'elections', 'candidates', 'watchlists', 
      'user_analytics', 'engagement_metrics', 'votes_intent',
      'election_cycles', 'user_preferences', 'interaction_logs'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) throw new Error(`Table ${table} inaccessible: ${error.message}`);
    }

    // Test database functions
    const { data: countdownData, error: countdownError } = await supabase
      .rpc('get_election_countdown_cache');
    
    if (countdownError) {
      testResults.warnings.push(`Database function test failed: ${countdownError.message}`);
    } else {
      testResults.passed.push('Database: Functions working properly');
    }

    testResults.passed.push('Database: All tables accessible and responsive');
  } catch (error) {
    testResults.failed.push(`Database: ${error.message}`);
  }
}
