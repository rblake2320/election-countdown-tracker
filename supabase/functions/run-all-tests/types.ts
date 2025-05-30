
export interface TestResults {
  passed: string[];
  failed: string[];
  warnings: string[];
}

export interface TestReport {
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
  };
  details: {
    passed: string[];
    failed: string[];
    warnings: string[];
  };
  status: 'PERFECT' | 'READY' | 'CRITICAL' | 'ERROR';
  message: string;
  score: number;
  timestamp: string;
}
