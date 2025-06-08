
export interface ElectionData {
  office_level: string;
  office_name: string;
  state: string;
  election_dt: string;
  is_special: boolean;
  description: string;
}

export interface CandidateData {
  election_id?: string;
  name: string;
  party: string;
  incumbent: boolean;
  poll_pct: number;
  intent_pct: number;
}

export interface ProcessingResult {
  success: boolean;
  electionsCreated: number;
  candidatesCreated: number;
  message: string;
}
