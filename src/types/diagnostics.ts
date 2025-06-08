
export interface DiagnosticResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export interface SystemStatus {
  database: DiagnosticResult[];
  edgeFunctions: DiagnosticResult[];
  dataIngestion: DiagnosticResult[];
  authentication: DiagnosticResult[];
  security: DiagnosticResult[];
  overall: 'healthy' | 'warning' | 'critical';
}
