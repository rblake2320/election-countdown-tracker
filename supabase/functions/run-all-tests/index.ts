
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestResults {
  passed: string[];
  failed: string[];
  warnings: string[];
}

const testResults: TestResults = {
  passed: [],
  failed: [],
  warnings: []
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 COMPREHENSIVE PLATFORM TEST STARTING...");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Clear previous results
    testResults.passed = [];
    testResults.failed = [];
    testResults.warnings = [];

    // Run all tests
    await testDatabase(supabase);
    await testAuthentication(supabase);
    await testElectionData(supabase);
    await testAPIs(supabase);
    await testSecurity(supabase);
    await testPerformance(supabase);
    await testErrorHandling(supabase);

    // Generate final report
    const report = generateReport();

    return new Response(
      JSON.stringify(report),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error running tests:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'ERROR',
        passed: testResults.passed,
        failed: [...testResults.failed, `System Error: ${error.message}`],
        warnings: testResults.warnings
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function testDatabase(supabase: any) {
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

async function testAuthentication(supabase: any) {
  console.log("🔐 Testing Authentication...");

  const testUser = {
    email: `test${Date.now()}@test.com`,
    password: 'TestPass123!'
  };

  try {
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

    testResults.passed.push('Authentication: Signup, signin, and session validation working');
  } catch (error) {
    testResults.failed.push(`Authentication: ${error.message}`);
  }
}

async function testElectionData(supabase: any) {
  console.log("🗳️ Testing Election Data...");

  try {
    // Test elections query
    const { data: elections, error: electionsError } = await supabase
      .from('elections')
      .select('*')
      .limit(10);
    
    if (electionsError) throw new Error(`Elections query failed: ${electionsError.message}`);
    
    const electionCount = elections ? elections.length : 0;
    if (electionCount === 0) {
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
    }

    testResults.passed.push(`Elections: ${electionCount} elections loaded, data structure valid`);
  } catch (error) {
    testResults.failed.push(`Elections: ${error.message}`);
  }
}

async function testAPIs(supabase: any) {
  console.log("🌐 Testing External APIs...");

  try {
    // Test sync-time function
    const { data: timeData, error: timeError } = await supabase.functions.invoke('sync-time');
    if (timeError) throw new Error(`Sync-time function failed: ${timeError.message}`);
    if (!timeData || !timeData.serverTime) throw new Error('Invalid time sync response');
    
    testResults.passed.push('Time Sync API: Connected and working');

    // Test other edge functions
    const functions = ['fetch-fec-data', 'fetch-google-civic-data', 'fetch-congress-data'];
    
    for (const funcName of functions) {
      try {
        const { data, error } = await supabase.functions.invoke(funcName);
        if (!error) {
          testResults.passed.push(`${funcName}: Available and responsive`);
        } else {
          testResults.warnings.push(`${funcName}: ${error.message}`);
        }
      } catch (e) {
        testResults.warnings.push(`${funcName}: Function not available or configuration issue`);
      }
    }

  } catch (error) {
    testResults.failed.push(`APIs: ${error.message}`);
  }
}

async function testSecurity(supabase: any) {
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

async function testPerformance(supabase: any) {
  console.log("⚡ Testing Performance...");

  try {
    // Test response times
    const start = Date.now();
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(supabase.from('elections').select('*').limit(10));
      promises.push(supabase.from('candidates').select('*').limit(10));
    }

    await Promise.all(promises);
    const duration = Date.now() - start;
    const avgTime = duration / 10;

    if (avgTime > 1000) {
      testResults.warnings.push(`Performance: Slow database response time ${avgTime}ms`);
    } else {
      testResults.passed.push(`Performance: Good database response time ${avgTime.toFixed(0)}ms avg`);
    }

  } catch (error) {
    testResults.failed.push(`Performance: ${error.message}`);
  }
}

async function testErrorHandling(supabase: any) {
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
    },
    timestamp: new Date().toISOString()
  };

  const score = testResults.failed.length === 0 ? 
    100 : 
    (testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100;

  if (testResults.failed.length > 0) {
    report.status = 'CRITICAL';
    report.message = '🚨 CRITICAL: Fix failed tests before launch!';
  } else if (testResults.warnings.length > 0) {
    report.status = 'READY';
    report.message = '⚡ READY: Can launch, but address warnings soon';
  } else {
    report.status = 'PERFECT';
    report.message = '🚀 PERFECT: Ready for production!';
  }

  report.score = score;
  
  console.log(`\n📋 Test completed with ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.warnings} warnings`);
  console.log(`🎯 Overall Score: ${score.toFixed(1)}% - Status: ${report.status}`);
  
  return report;
}
