
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TestResults } from './types.ts'
import { testDatabase } from './database-tests.ts'
import { testAuthentication } from './auth-tests.ts'
import { testElectionDataComprehensive } from './election-data-tests.ts'
import { testAPIs } from './api-tests.ts'
import { testSecurity } from './security-tests.ts'
import { testPerformance } from './performance-tests.ts'
import { testErrorHandling } from './error-handling-tests.ts'
import { generateReport } from './report-generator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Initialize test results
    const testResults: TestResults = {
      passed: [],
      failed: [],
      warnings: []
    };

    // Run all tests
    await testDatabase(supabase, testResults);
    await testAuthentication(supabase, testResults);
    await testElectionDataComprehensive(supabase, testResults);
    await testAPIs(supabase, testResults);
    await testSecurity(supabase, testResults);
    await testPerformance(supabase, testResults);
    await testErrorHandling(supabase, testResults);

    // Generate final report
    const report = generateReport(testResults);

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
        passed: [],
        failed: [`System Error: ${error.message}`],
        warnings: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
