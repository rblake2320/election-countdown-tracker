
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

    // STRICT requirement for launch readiness
    const MINIMUM_REQUIRED_ELECTIONS = 160; // User requirement
    if (totalElections < MINIMUM_REQUIRED_ELECTIONS) {
      testResults.failed.push(`CRITICAL: Only ${totalElections} elections found, MUST have at least ${MINIMUM_REQUIRED_ELECTIONS} for launch. Platform is NOT launch-ready.`);
    } else {
      testResults.passed.push(`Election Count: ${totalElections} elections loaded (meets ${MINIMUM_REQUIRED_ELECTIONS}+ requirement)`);
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

    // Check for federal elections (strict requirements)
    if (!levelCounts['Federal'] || levelCounts['Federal'] < 50) {
      testResults.failed.push(`INSUFFICIENT: Federal elections (found ${levelCounts['Federal'] || 0}, need 50+ for all states/territories)`);
    } else {
      testResults.passed.push(`Federal Elections: ${levelCounts['Federal']} found (adequate coverage)`);
    }

    // Check for state elections (strict requirements)
    if (!levelCounts['State'] || levelCounts['State'] < 50) {
      testResults.failed.push(`INSUFFICIENT: State elections (found ${levelCounts['State'] || 0}, need 50+ for all states)`);
    } else {
      testResults.passed.push(`State Elections: ${levelCounts['State']} found (adequate coverage)`);
    }

    // Check for local elections (strict requirements)
    if (!levelCounts['Local'] || levelCounts['Local'] < 50) {
      testResults.failed.push(`INSUFFICIENT: Local elections (found ${levelCounts['Local'] || 0}, need 50+ for comprehensive local coverage)`);
    } else {
      testResults.passed.push(`Local Elections: ${levelCounts['Local']} found (adequate coverage)`);
    }

    // Test state coverage - must have elections in all 50 states + territories
    const { data: stateData, error: stateError } = await supabase
      .from('elections')
      .select('state')
      .not('state', 'is', null);

    if (stateError) throw new Error(`State coverage query failed: ${stateError.message}`);

    const uniqueStates = [...new Set(stateData.map(e => e.state))];
    const requiredStatesAndTerritories = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'DC' // At minimum all 50 states + DC
    ];

    const missingStates = requiredStatesAndTerritories.filter(state => !uniqueStates.includes(state));
    
    if (missingStates.length > 0) {
      testResults.failed.push(`INCOMPLETE COVERAGE: Missing elections for states/territories: ${missingStates.join(', ')}`);
    } else {
      testResults.passed.push(`Geographic Coverage: Elections found for all ${uniqueStates.length} states/territories`);
    }

    // Test upcoming vs past elections
    const { data: upcomingElections, error: upcomingError } = await supabase
      .from('elections')
      .select('id, election_dt')
      .gte('election_dt', new Date().toISOString());

    if (upcomingError) throw new Error(`Upcoming elections query failed: ${upcomingError.message}`);

    const upcomingCount = upcomingElections?.length || 0;
    if (upcomingCount < 100) {
      testResults.failed.push(`INSUFFICIENT UPCOMING: Only ${upcomingCount} upcoming elections found. Need 100+ for meaningful countdown experience.`);
    } else {
      testResults.passed.push(`Upcoming Elections: ${upcomingCount} elections scheduled`);
    }

    // Test candidates data
    const { count: totalCandidates, error: candidatesCountError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true });
    
    if (candidatesCountError) throw new Error(`Candidates count query failed: ${candidatesCountError.message}`);

    if (totalCandidates < 100) {
      testResults.warnings.push(`LIMITED: Only ${totalCandidates} candidates found. Consider adding more candidate data for better user experience.`);
    } else {
      testResults.passed.push(`Candidates: ${totalCandidates} candidates loaded`);
    }

    // Overall launch readiness assessment
    if (totalElections >= MINIMUM_REQUIRED_ELECTIONS && upcomingCount >= 100 && missingStates.length === 0) {
      testResults.passed.push('🚀 LAUNCH READY: Platform meets all requirements for comprehensive election coverage');
    } else {
      testResults.failed.push('❌ NOT LAUNCH READY: Platform lacks sufficient election data for launch');
    }

  } catch (error) {
    testResults.failed.push(`Election Data: ${error.message}`);
  }
}
