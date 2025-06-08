
import { ElectionData, CandidateData, ProcessingResult } from './types.ts';
import { STATES } from './constants.ts';
import { generateFederalElections, generateStateElections, generateLocalElections, generateCandidates } from './electionGenerators.ts';
import { insertElectionsInBatches, insertCandidates } from './dataProcessor.ts';

export const processAllElections = async (supabase: any): Promise<ProcessingResult> => {
  console.log('Starting comprehensive election data creation...');
  
  const elections: ElectionData[] = [];

  // Generate elections for all states
  for (const state of STATES) {
    elections.push(
      ...generateFederalElections(state),
      ...generateStateElections(state),
      ...generateLocalElections(state)
    );
  }

  console.log(`Created ${elections.length} elections to insert`);

  // Insert elections in batches
  const totalInserted = await insertElectionsInBatches(supabase, elections);

  // Generate and insert candidates
  const candidates = generateCandidates(elections);
  const candidatesInserted = await insertCandidates(supabase, candidates);

  return {
    success: true,
    electionsCreated: totalInserted,
    candidatesCreated: candidatesInserted,
    message: `Comprehensive election data created: ${totalInserted} elections across all states and territories`
  };
};
