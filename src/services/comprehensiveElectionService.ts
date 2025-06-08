
import { electionDataValidator } from './electionDataValidator';
import { electionDataGenerator } from './electionDataGenerator';
import { electionDataFetcher } from './electionDataFetcher';

export const comprehensiveElectionService = {
  // Data validation methods
  verifyDataCompleteness: electionDataValidator.verifyDataCompleteness,
  
  // Data generation methods
  ensureComprehensiveData: electionDataGenerator.ensureComprehensiveData,
  
  // Data fetching methods
  fetchAllElections: electionDataFetcher.fetchAllElections
};

// Re-export types for convenience
export type { ElectionDataStatus, ComprehensiveDataResult } from '@/types/electionDataStatus';
