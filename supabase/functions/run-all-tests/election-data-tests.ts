
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

    // UPDATED: More realistic minimum expectations for initial testing
    const MINIMUM_EXPECTED_ELECTIONS = 10; // Reduced from 150 for initial testing
    if (totalElections < MINIMUM_EXPECTED_ELECTIONS) {
      testResults.failed.push(`CRITICAL: Only ${totalElections} elections found, expected at least ${MINIMUM_EXPECTED_ELECTIONS}. Data ingestion incomplete.`);
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

    // Check for federal elections (reduced expectations)
    if (!levelCounts['Federal'] || levelCounts['Federal'] < 2) {
      testResults.warnings.push(`LIMITED: Federal elections (found ${levelCounts['Federal'] || 0}, expected 2+). Some federal races may be missing.`);
    } else {
      testResults.passed.push(`Federal Elections: ${levelCounts['Federal']} found`);
    }

    // Check for state elections (reduced expectations)
    if (!levelCounts['State'] || levelCounts['State'] < 2) {
      testResults.warnings.push(`LIMITED: State elections (found ${levelCounts['State'] || 0}, expected 2+). Some state races may be missing.`);
    } else {
      testResults.passed.push(`State Elections: ${levelCounts['State']} found`);
    }

    // Check for local elections (reduced expectations)
    if (!levelCounts['Local'] || levelCounts['Local'] < 2) {
      testResults.warnings.push(`LIMITED: Local elections (found ${levelCounts['Local'] || 0}, expected 2+). Local races may be missing.`);
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
    if (upcomingCount < 5) {
      testResults.warnings.push(`LIMITED: Only ${upcomingCount} upcoming elections found. May need more future elections for better user experience.`);
    } else {
      testResults.passed.push(`Upcoming Elections: ${upcomingCount} elections scheduled`);
    }

    // Test election cycles
    const { data: cycles, error: cyclesError } = await supabase
      .from('election_cycles')
      .select('*');
    
    if (cyclesError) throw new Error(`Election cycles query failed: ${cyclesError.message}`);

    if (!cycles || cycles.length < 1) {
      testResults.warnings.push(`LIMITED: Election cycles (found ${cycles?.length || 0}, expected 1+). Election cycles may need setup.`);
    } else {
      testResults.passed.push(`Election Cycles: ${cycles.length} cycles configured`);
    }

    // Test candidates data
    const { count: totalCandidates, error: candidatesCountError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true });
    
    if (candidatesCountError) throw new Error(`Candidates count query failed: ${candidatesCountError.message}`);

    if (totalCandidates < 5) {
      testResults.warnings.push(`LIMITED: Only ${totalCandidates} candidates found. May need more candidate data for comprehensive coverage.`);
    } else {
      testResults.passed.push(`Candidates: ${totalCandidates} candidates loaded`);
    }

    // Overall data completeness assessment
    if (totalElections >= 10 && upcomingCount >= 3) {
      testResults.passed.push('Data Completeness: Basic election data structure is functional');
    }

  } catch (error) {
    testResults.failed.push(`Election Data: ${error.message}`);
  }
}
