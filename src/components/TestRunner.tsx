
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestExecutionButton } from './TestExecutionButton';
import { TestSummaryCard } from './TestSummaryCard';
import { TestResultsList } from './TestResultsList';
import { DataIngestionDiagnostics } from './DataIngestionDiagnostics';

interface TestReport {
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

export const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<TestReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    setReport(null);

    try {
      console.log('Starting comprehensive test suite...');
      
      const { data, error } = await supabase.functions.invoke('run-all-tests');
      
      if (error) {
        throw new Error(`Test execution failed: ${error.message}`);
      }

      setReport(data);
      console.log('Test suite completed:', data);
    } catch (err) {
      console.error('Error running test suite:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Tabs defaultValue="test-suite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test-suite">Comprehensive Test Suite</TabsTrigger>
          <TabsTrigger value="data-diagnostics">Data Ingestion Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test-suite" className="space-y-6">
          <TestExecutionButton 
            isRunning={isRunning}
            error={error}
            onRunTests={runTests}
          />

          {report && (
            <div className="space-y-4">
              <TestSummaryCard report={report} />
              <TestResultsList 
                passed={report.details.passed}
                failed={report.details.failed}
                warnings={report.details.warnings}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="data-diagnostics">
          <DataIngestionDiagnostics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
