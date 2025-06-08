
import React, { useState } from 'react';
import { Database, Loader2, Bug } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemStatus } from '@/types/diagnostics';
import { DiagnosticSection } from './diagnostics/DiagnosticSection';
import { OverallStatusCard } from './diagnostics/OverallStatusCard';
import { useDatabaseTests } from '@/hooks/useDatabaseTests';
import { useEdgeFunctionTests } from '@/hooks/useEdgeFunctionTests';
import { useDataIngestionTests } from '@/hooks/useDataIngestionTests';
import { useAuthenticationTests } from '@/hooks/useAuthenticationTests';
import { useSecurityTests } from '@/hooks/useSecurityTests';

export const ComprehensiveDiagnostics: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemStatus | null>(null);

  const { testDatabase } = useDatabaseTests();
  const { testEdgeFunctions } = useEdgeFunctionTests();
  const { testDataIngestion } = useDataIngestionTests();
  const { testAuthentication } = useAuthenticationTests();
  const { testSecurity } = useSecurityTests();

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true);
    setResults(null);

    const diagnostics: SystemStatus = {
      database: [],
      edgeFunctions: [],
      dataIngestion: [],
      authentication: [],
      security: [],
      overall: 'healthy'
    };

    console.log('🔍 Starting comprehensive diagnostics...');

    // Run all tests
    await testDatabase(diagnostics);
    await testEdgeFunctions(diagnostics);
    await testDataIngestion(diagnostics);
    await testAuthentication(diagnostics);
    await testSecurity(diagnostics);

    // Determine overall status
    const failedTests = Object.values(diagnostics).flat().filter(test => test.status === 'fail').length;
    const warningTests = Object.values(diagnostics).flat().filter(test => test.status === 'warning').length;

    if (failedTests > 0) {
      diagnostics.overall = 'critical';
    } else if (warningTests > 0) {
      diagnostics.overall = 'warning';
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-6 h-6" />
          <span>Comprehensive System Diagnostics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runComprehensiveDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Running Comprehensive Diagnostics...
              </>
            ) : (
              <>
                <Bug className="w-4 h-4 mr-2" />
                Run Full System Diagnostics
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-4">
              <OverallStatusCard status={results.overall} />
              <DiagnosticSection title="Database Tests" tests={results.database} />
              <DiagnosticSection title="Edge Functions" tests={results.edgeFunctions} />
              <DiagnosticSection title="Data Ingestion" tests={results.dataIngestion} />
              <DiagnosticSection title="Authentication" tests={results.authentication} />
              <DiagnosticSection title="Security & Policies" tests={results.security} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
