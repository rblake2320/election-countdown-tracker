
export interface ElectionDataStatus {
  totalElections: number;
  federalElections: number;
  stateElections: number;
  localElections: number;
  upcomingElections: number;
  statesCovered: string[];
  isComprehensive: boolean;
  missingRequirements: string[];
}

export interface ComprehensiveDataResult {
  success: boolean;
  message: string;
  dataStatus: ElectionDataStatus;
}
