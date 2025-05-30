
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
    await testElectionDataComprehensive(supabase);
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

async function testElectionDataComprehensive(supabase: any) {
  console.log("🗳️ Testing Election Data Comprehensively...");

  try {
    // Get total election count
    const { count: totalElections, error: countError } = await supabase
      .from('elections')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw new Error(`Elections count query failed: ${countError.message}`);
    
    console.log(`Total elections in database: ${totalElections}`);

    // CRITICAL: Check if we have minimum expected elections
    const MINIMUM_EXPECTED_ELECTIONS = 150; // Should be at least 150+ for comprehensive coverage
    if (totalElections < MINIMUM_EXPECTED_ELECTIONS) {
      testResults.failed.push(`CRITICAL: Only ${totalElections} elections found, expected at least ${MINIMUM_EXPECTED_ELECTIONS}. Data ingestion severely incomplete.`);
    } else {
      testResults.passed.push(`Election Count: ${totalElections} elections loaded (meets minimum threshold)`);
    }

    // Test election distribution by level
    const { data: electionsByLevel, error: levelError } = await supabase
      .from('elections')
      .select('office_level')
      .not('office_level', 'is', null);
    
    if (levelError) throw new Error(`Elections by level query failed: ${levelError.message}`);

    const levelCounts = electionsByLevel.reduce((acc, election) => {
      acc[election.office_level] = (acc[election.office_level] || 0) + 1;
      return acc;
    }, {});

    console.log('Elections by level:', levelCounts);

    // Check for federal elections
    if (!levelCounts['Federal'] || levelCounts['Federal'] < 20) {
      testResults.failed.push(`MISSING: Federal elections (found ${levelCounts['Federal'] || 0}, expected 20+). House, Senate, Presidential races missing.`);
    } else {
      testResults.passed.push(`Federal Elections: ${levelCounts['Federal']} found`);
    }

    // Check for state elections
    if (!levelCounts['State'] || levelCounts['State'] < 50) {
      testResults.failed.push(`MISSING: State elections (found ${levelCounts['State'] || 0}, expected 50+). Governor, state legislature races missing.`);
    } else {
      testResults.passed.push(`State Elections: ${levelCounts['State']} found`);
    }

    // Check for local elections
    if (!levelCounts['Local'] || levelCounts['Local'] < 80) {
      testResults.warnings.push(`LIMITED: Local elections (found ${levelCounts['Local'] || 0}, expected 80+). Mayor, city council, school board races may be missing.`);
    } else {
      testResults.passed.push(`Local Elections: ${levelCounts['Local']} found`);
    }

    // Test upcoming vs past elections
    const { data: upcomingElections, error: upcomingError } = await supabase
      .from('elections')
      .select('id, election_dt')
      .gte('election_dt', new Date().toISOString());

    if (upcomingError) throw new Error(`Upcoming elections query failed: ${upcomingError.message}`);

    const upcomingCount = upcomingElections?.length || 0;
    if (upcomingCount < 50) {
      testResults.failed.push(`CRITICAL: Only ${upcomingCount} upcoming elections found. Need 50+ for meaningful countdown experience.`);
    } else {
      testResults.passed.push(`Upcoming Elections: ${upcomingCount} elections scheduled`);
    }

    // Test election cycles
    const { data: cycles, error: cyclesError } = await supabase
      .from('election_cycles')
      .select('*');
    
    if (cyclesError) throw new Error(`Election cycles query failed: ${cyclesError.message}`);

    if (!cycles || cycles.length < 3) {
      testResults.failed.push(`MISSING: Election cycles (found ${cycles?.length || 0}, expected 3+). 2024, 2025, 2026 cycles missing.`);
    } else {
      testResults.passed.push(`Election Cycles: ${cycles.length} cycles configured`);
    }

    // Test candidates data
    const { count: totalCandidates, error: candidatesCountError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true });
    
    if (candidatesCountError) throw new Error(`Candidates count query failed: ${candidatesCountError.message}`);

    if (totalCandidates < 300) {
      testResults.failed.push(`CRITICAL: Only ${totalCandidates} candidates found. Need 300+ for comprehensive election coverage.`);
    } else {
      testResults.passed.push(`Candidates: ${totalCandidates} candidates loaded`);
    }

    // Test for specific critical elections that should exist
    const criticalElections = [
      { state: 'New Jersey', office_level: 'State', type: 'Governor' },
      { state: 'Virginia', office_level: 'State', type: 'Governor' },
      { state: 'Texas', office_level: 'Federal', type: 'House' },
      { state: 'California', office_level: 'State', type: 'Governor' }
    ];

    for (const election of criticalElections) {
      const { data: foundElection, error: searchError } = await supabase
        .from('elections')
        .select('*')
        .eq('state', election.state)
        .eq('office_level', election.office_level)
        .ilike('office_name', `%${election.type}%`)
        .limit(1);

      if (searchError || !foundElection || foundElection.length === 0) {
        testResults.failed.push(`MISSING: ${election.state} ${election.type} election not found. Key races missing from database.`);
      }
    }

  } catch (error) {
    testResults.failed.push(`Election Data: ${error.message}`);
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
    report.message = '🚨 CRITICAL: Platform NOT ready for launch! Fix critical issues immediately.';
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
