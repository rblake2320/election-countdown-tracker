
import { ElectionData, CandidateData, ProcessingResult } from './types.ts';

export const insertElectionsInBatches = async (
  supabase: any,
  elections: ElectionData[]
): Promise<number> => {
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < elections.length; i += batchSize) {
    const batch = elections.slice(i, i + batchSize);
    
    const { error: batchError } = await supabase
      .from('elections')
      .upsert(batch, { 
        onConflict: 'office_name,state,election_dt',
        ignoreDuplicates: true 
      });

    if (batchError) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, batchError);
    } else {
      totalInserted += batch.length;
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} elections`);
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return totalInserted;
};

export const insertCandidates = async (
  supabase: any,
  candidates: CandidateData[]
): Promise<number> => {
  if (candidates.length === 0) return 0;

  const { error: candidatesError } = await supabase
    .from('candidates')
    .upsert(candidates, { ignoreDuplicates: true });

  if (candidatesError) {
    console.log('Note: Could not insert candidates (elections may need IDs first)');
    return 0;
  }

  return candidates.length;
};
