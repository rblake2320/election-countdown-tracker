
import { TestResults } from './types.ts';

export async function testElectionDataComprehensive(supabase: any, testResults: TestResults) {
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
