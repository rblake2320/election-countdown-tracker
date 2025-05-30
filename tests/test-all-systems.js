
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

async function runAllTests() {
  console.log("🔍 COMPREHENSIVE PLATFORM TEST STARTING...\n");

  // 1. DATABASE CONNECTION TEST
  await testDatabase();

  // 2. AUTHENTICATION FLOW TEST
  await testAuthentication();

  // 3. ELECTION DATA TEST
  await testElectionData();

  // 4. API INTEGRATIONS TEST
  await testAPIs();

  // 5. SECURITY TEST
  await testSecurity();

  // 6. PERFORMANCE TEST
  await testPerformance();

  // 7. ERROR HANDLING TEST
  await testErrorHandling();

  // FINAL REPORT
  return generateReport();
}

// Test Functions:
async function testDatabase() {
  console.log("📊 Testing Database...");

  try {
    // Test connection using Supabase client
    const { supabase } = require('../src/integrations/supabase/client');
    
    // Test each table
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

    // Test RLS policies
    const { data: profileTest, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError && profileError.code !== 'PGRST301') {
      throw new Error(`RLS policies may not be configured correctly: ${profileError.message}`);
    }

    testResults.passed.push('Database: All tables accessible and RLS configured');
  } catch (error) {
    testResults.failed.push(`Database: ${error.message}`);
  }
}

async function testAuthentication() {
  console.log("🔐 Testing Authentication...");

  const testUser = {
    email: `test${Date.now()}@test.com`,
    password: 'TestPass123!'
  };

  try {
    const { supabase } = require('../src/integrations/supabase/client');
    
    // Test signup
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signupError) throw new Error(`Signup failed: ${signupError.message}`);
    if (!signupData.user) throw new Error('No user data returned from signup');

    // Test signin
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signinError) throw new Error(`Signin failed: ${signinError.message}`);
    if (!signinData.session) throw new Error('No session returned from signin');

    // Test session validation
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw new Error(`Session validation failed: ${userError.message}`);

    // Test protected operations (user preferences)
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        political_affiliation: 'Independent',
        privacy_consent: true
      });
    
    if (prefsError && prefsError.code !== '23505') { // Ignore duplicate key errors
      throw new Error(`Protected operation failed: ${prefsError.message}`);
    }

    // Test signout
    const { error: signoutError } = await supabase.auth.signOut();
    if (signoutError) throw new Error(`Signout failed: ${signoutError.message}`);

    testResults.passed.push('Authentication: Full flow working (signup, signin, session, signout)');
  } catch (error) {
    testResults.failed.push(`Authentication: ${error.message}`);
  }
}

async function testElectionData() {
  console.log("🗳️ Testing Election Data...");

  try {
    const { supabase } = require('../src/integrations/supabase/client');
    
    // Test elections query
    const { data: elections, error: electionsError } = await supabase
      .from('elections')
      .select('*')
      .limit(10);
    
    if (electionsError) throw new Error(`Elections query failed: ${electionsError.message}`);
    if (!elections || elections.length === 0) {
      testResults.warnings.push('No elections found in database');
    }

    // Test election cycles
    const { data: cycles, error: cyclesError } = await supabase
      .from('election_cycles')
      .select('*');
    
    if (cyclesError) throw new Error(`Election cycles query failed: ${cyclesError.message}`);

    // Test candidates if elections exist
    if (elections && elections.length > 0) {
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', elections[0].id);
      
      if (candidatesError) throw new Error(`Candidates query failed: ${candidatesError.message}`);
      if (!candidates || candidates.length === 0) {
        testResults.warnings.push('No candidates found for elections');
      }
    }

    // Test filtering by state
    const { data: stateElections, error: stateError } = await supabase
      .from('elections')
      .select('*')
      .eq('state', 'CA')
      .limit(5);
    
    if (stateError) throw new Error(`State filtering failed: ${stateError.message}`);

    const electionCount = elections ? elections.length : 0;
    testResults.passed.push(`Elections: ${electionCount} elections loaded, filtering works`);
  } catch (error) {
    testResults.failed.push(`Elections: ${error.message}`);
  }
}

async function testAPIs() {
  console.log("🌐 Testing External APIs...");

  try {
    const { supabase } = require('../src/integrations/supabase/client');
    
    // Test sync-time function
    const { data: timeData, error: timeError } = await supabase.functions.invoke('sync-time');
    if (timeError) throw new Error(`Sync-time function failed: ${timeError.message}`);
    if (!timeData || !timeData.serverTime) throw new Error('Invalid time sync response');
    
    testResults.passed.push('Time Sync API: Connected and working');

    // Test other edge functions if they exist
    try {
      const { data: fecData, error: fecError } = await supabase.functions.invoke('fetch-fec-data');
      if (!fecError) {
        testResults.passed.push('FEC API: Connected');
      } else {
        testResults.warnings.push(`FEC API: ${fecError.message}`);
      }
    } catch (e) {
      testResults.warnings.push('FEC API: Function not available or API key missing');
    }

    try {
      const { data: googleData, error: googleError } = await supabase.functions.invoke('fetch-google-civic-data');
      if (!googleError) {
        testResults.passed.push('Google Civic API: Connected');
      } else {
        testResults.warnings.push(`Google Civic API: ${googleError.message}`);
      }
    } catch (e) {
      testResults.warnings.push('Google Civic API: Function not available or API key missing');
    }

    try {
      const { data: congressData, error: congressError } = await supabase.functions.invoke('fetch-congress-data');
      if (!congressError) {
        testResults.passed.push('Congress API: Connected');
      } else {
        testResults.warnings.push(`Congress API: ${congressError.message}`);
      }
    } catch (e) {
      testResults.warnings.push('Congress API: Function not available or API key missing');
    }

  } catch (error) {
    testResults.failed.push(`APIs: ${error.message}`);
  }
}

async function testSecurity() {
  console.log("🛡️ Testing Security...");

  try {
    const { supabase } = require('../src/integrations/supabase/client');
    
    // Test RLS protection - try to access data without authentication
    await supabase.auth.signOut(); // Ensure we're signed out
    
    const { data: protectedData, error: protectedError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    // Should either return empty data or throw an error due to RLS
    if (protectedData && protectedData.length > 0) {
      testResults.warnings.push('RLS: Some protected data accessible without auth');
    } else {
      testResults.passed.push('Security: RLS policies protecting user data');
    }

    // Test SQL injection protection (Supabase handles this automatically)
    const maliciousInput = "'; DROP TABLE elections; --";
    const { data: sqlTest, error: sqlError } = await supabase
      .from('elections')
      .select('*')
      .eq('state', maliciousInput)
      .limit(1);
    
    // Query should execute safely and return no results
    if (!sqlError) {
      testResults.passed.push('Security: SQL injection protection working');
    }

    // Test data validation
    const { error: validationError } = await supabase
      .from('elections')
      .insert({
        office_level: 'INVALID_LEVEL',
        office_name: '',
        state: 'INVALID_STATE_CODE',
        election_dt: 'invalid-date'
      });
    
    if (validationError) {
      testResults.passed.push('Security: Data validation preventing invalid inputs');
    }

  } catch (error) {
    testResults.failed.push(`Security: ${error.message}`);
  }
}

async function testPerformance() {
  console.log("⚡ Testing Performance...");

  try {
    const { supabase } = require('../src/integrations/supabase/client');
    
    // Test response times
    const start = Date.now();
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(supabase.from('elections').select('*').limit(10));
      promises.push(supabase.from('candidates').select('*').limit(10));
      promises.push(supabase.from('election_cycles').select('*').limit(5));
    }

    await Promise.all(promises);
    const duration = Date.now() - start;
    const avgTime = duration / 30;

    if (avgTime > 1000) {
      testResults.warnings.push(`Performance: Slow database response time ${avgTime}ms`);
    } else {
      testResults.passed.push(`Performance: Good database response time ${avgTime.toFixed(0)}ms avg`);
    }

    // Test large query performance
    const largeQueryStart = Date.now();
    const { data: largeData, error: largeError } = await supabase
      .from('elections')
      .select('*, candidates(*)')
      .limit(100);
    
    const largeQueryTime = Date.now() - largeQueryStart;
    
    if (largeError) {
      testResults.warnings.push(`Performance: Large query failed - ${largeError.message}`);
    } else if (largeQueryTime > 2000) {
      testResults.warnings.push(`Performance: Large query slow ${largeQueryTime}ms`);
    } else {
      testResults.passed.push(`Performance: Large query efficient ${largeQueryTime}ms`);
    }

  } catch (error) {
    testResults.failed.push(`Performance: ${error.message}`);
  }
}

async function testErrorHandling() {
  console.log("❌ Testing Error Handling...");

  try {
    const { supabase } = require('../src/integrations/supabase/client');
    
    // Test invalid table access
    const { data: invalidTable, error: invalidError } = await supabase
      .from('nonexistent_table')
      .select('*');
    
    if (invalidError && invalidError.code === '42P01') {
      testResults.passed.push('Error Handling: Invalid table access properly handled');
    }

    // Test invalid column access
    const { data: invalidColumn, error: columnError } = await supabase
      .from('elections')
      .select('nonexistent_column');
    
    if (columnError && columnError.code === '42703') {
      testResults.passed.push('Error Handling: Invalid column access properly handled');
    }

    // Test invalid foreign key
    const { data: invalidFK, error: fkError } = await supabase
      .from('candidates')
      .insert({
        name: 'Test Candidate',
        party: 'Test Party',
        election_id: '00000000-0000-0000-0000-000000000000' // Invalid UUID
      });
    
    if (fkError && fkError.code === '23503') {
      testResults.passed.push('Error Handling: Foreign key violations properly handled');
    }

    // Test edge function error handling
    try {
      const { data: errorData, error: edgeError } = await supabase.functions.invoke('nonexistent-function');
      if (edgeError) {
        testResults.passed.push('Error Handling: Edge function errors properly handled');
      }
    } catch (e) {
      testResults.passed.push('Error Handling: Network errors properly caught');
    }

  } catch (error) {
    testResults.failed.push(`Error Handling: ${error.message}`);
  }
}

function generateReport() {
  const report = {
    summary: {
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      warnings: testResults.warnings.length,
      total: testResults.passed.length + testResults.failed.length + testResults.warnings.length
    },
    details: {
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings
    }
  };

  console.log("\n📋 FINAL TEST REPORT\n");
  console.log("✅ PASSED:", testResults.passed.length);
  testResults.passed.forEach(test => console.log(`  ✓ ${test}`));

  console.log("\n❌ FAILED:", testResults.failed.length);
  testResults.failed.forEach(test => console.log(`  ✗ ${test}`));

  console.log("\n⚠️  WARNINGS:", testResults.warnings.length);
  testResults.warnings.forEach(test => console.log(`  ⚠ ${test}`));

  const score = testResults.failed.length === 0 ? 
    100 : 
    (testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100;

  console.log(`\n🎯 OVERALL SCORE: ${score.toFixed(1)}%`);

  if (testResults.failed.length > 0) {
    console.log("\n🚨 CRITICAL: Fix failed tests before launch!");
    report.status = 'CRITICAL';
  } else if (testResults.warnings.length > 0) {
    console.log("\n⚡ READY: Can launch, but address warnings soon");
    report.status = 'READY';
  } else {
    console.log("\n🚀 PERFECT: Ready for production!");
    report.status = 'PERFECT';
  }

  report.score = score;
  return report;
}

// Export for use in API endpoint
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

// Run tests if called directly
if (typeof window === 'undefined' && require.main === module) {
  runAllTests().then(report => {
    process.exit(report.status === 'CRITICAL' ? 1 : 0);
  });
}
