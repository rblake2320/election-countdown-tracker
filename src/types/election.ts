
export interface Candidate {
  name: string;
  party: string;
  pollingPercentage: number;
  trend: 'up' | 'down' | 'stable';
  endorsements?: number;
}

export interface Election {
  id: string;
  title: string;
  date: string;
  type: string;
  state: string;
  description: string;
  candidates?: Candidate[];
  keyRaces?: string[];
}

export interface FilterOptions {
  party: string;
  state: string;
  electionType: string;
  timeUnit: string;
}
