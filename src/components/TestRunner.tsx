import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, Loader2, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PERFECT': return 'bg-green-500';
      case 'READY': return 'bg-yellow-500';
      case 'CRITICAL': return 'bg-red-500';
      case 'ERROR': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Tabs defaultValue="test-suite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test-suite">Comprehensive Test Suite</TabsTrigger>
          <TabsTrigger value="data-diagnostics">Data Ingestion Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test-suite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-6 h-6" />
                <span>Platform Test Suite</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Run comprehensive tests to verify database, authentication, election data completeness, APIs, security, performance, and error handling.
              </p>
              
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="flex items-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running Tests...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run All Tests</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Test Execution Error</span>
                </div>
                <p className="text-red-600 mt-2">{error}</p>
              </CardContent>
            </Card>
          )}

          {report && (
            <div className="space-y-4">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Test Results Summary</span>
                    <Badge className={`${getStatusColor(report.status)} text-white`}>
                      {report.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{report.summary.passed}</div>
                      <div className="text-sm text-gray-500">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{report.summary.failed}</div>
                      <div className="text-sm text-gray-500">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{report.summary.warnings}</div>
                      <div className="text-sm text-gray-500">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                        {report.score.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{report.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Test completed at {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Passed Tests */}
              {report.details.passed.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Passed Tests ({report.details.passed.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.details.passed.map((test, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{test}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Failed Tests */}
              {report.details.failed.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span>Failed Tests ({report.details.failed.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.details.failed.map((test, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{test}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {report.details.warnings.length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-yellow-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Warnings ({report.details.warnings.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.details.warnings.map((test, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{test}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
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
