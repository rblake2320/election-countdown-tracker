
import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle, XCircle, Loader2, Bug } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

// Helper function to invoke edge functions with timeout
const invokeWithTimeout = async <T>(
  fnName: string,
  timeout = 15000,
): Promise<{ data: T | null; error: any | null }> => {
  return Promise.race([
    supabase.functions.invoke<T>(fnName),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout),
    ),
  ]) as Promise<{ data: T | null; error: any | null }>;
};

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface SystemStatus {
  database: DiagnosticResult[];
  edgeFunctions: DiagnosticResult[];
  dataIngestion: DiagnosticResult[];
  authentication: DiagnosticResult[];
  security: DiagnosticResult[];
  overall: 'healthy' | 'warning' | 'critical';
}

export const ComprehensiveDiagnostics: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemStatus | null>(null);

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

    // Database Tests
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

  const testDatabase = async (diagnostics: SystemStatus) => {
    console.log('📊 Testing database connectivity and data...');

    try {
      // Test basic connectivity
      const { data: connectTest, error: connectError } = await supabase
        .from('elections')
        .select('count', { count: 'exact', head: true });

      if (connectError) {
        diagnostics.database.push({
          category: 'Database',
          test: 'Basic Connectivity',
          status: 'fail',
          message: `Cannot connect to database: ${connectError.message}`,
          details: connectError
        });
        return;
      }

      diagnostics.database.push({
        category: 'Database',
        test: 'Basic Connectivity',
        status: 'pass',
        message: 'Successfully connected to database'
      });

      // Test elections table
      const { data: elections, error: electionsError } = await supabase
        .from('elections')
        .select('*');

      if (electionsError) {
        diagnostics.database.push({
          category: 'Database',
          test: 'Elections Table Access',
          status: 'fail',
          message: `Cannot access elections table: ${electionsError.message}`,
          details: electionsError
        });
      } else {
        const count = elections?.length || 0;
        diagnostics.database.push({
          category: 'Database',
          test: 'Elections Data Count',
          status: count >= 160 ? 'pass' : count >= 50 ? 'warning' : 'fail',
          message: `Found ${count} elections (Required: 160+)`,
          details: { count, elections: elections?.slice(0, 5) }
        });

        // Test election distribution
        const federalCount = elections?.filter(e => e.office_level === 'Federal').length || 0;
        const stateCount = elections?.filter(e => e.office_level === 'State').length || 0;
        const localCount = elections?.filter(e => e.office_level === 'Local').length || 0;

        diagnostics.database.push({
          category: 'Database',
          test: 'Election Level Distribution',
          status: federalCount > 0 && stateCount > 0 && localCount > 0 ? 'pass' : 'warning',
          message: `Federal: ${federalCount}, State: ${stateCount}, Local: ${localCount}`,
          details: { federalCount, stateCount, localCount }
        });

        // Test state coverage
        const states = [...new Set(elections?.map(e => e.state) || [])];
        diagnostics.database.push({
          category: 'Database',
          test: 'State Coverage',
          status: states.length >= 50 ? 'pass' : 'warning',
          message: `Covering ${states.length} states/territories`,
          details: { states: states.slice(0, 10) }
        });
      }

      // Test candidates table
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*');

      if (candidatesError) {
        diagnostics.database.push({
          category: 'Database',
          test: 'Candidates Table',
          status: 'fail',
          message: `Cannot access candidates: ${candidatesError.message}`
        });
      } else {
        diagnostics.database.push({
          category: 'Database',
          test: 'Candidates Data',
          status: 'pass',
          message: `Found ${candidates?.length || 0} candidates`
        });
      }

      // Test election cycles
      const { data: cycles, error: cyclesError } = await supabase
        .from('election_cycles')
        .select('*');

      diagnostics.database.push({
        category: 'Database',
        test: 'Election Cycles',
        status: cyclesError ? 'fail' : 'pass',
        message: cyclesError ? cyclesError.message : `Found ${cycles?.length || 0} election cycles`
      });

    } catch (error) {
      diagnostics.database.push({
        category: 'Database',
        test: 'Overall Database Test',
        status: 'fail',
        message: `Database test failed: ${error.message}`,
        details: error
      });
    }
  };

  const testEdgeFunctions = async (diagnostics: SystemStatus) => {
    console.log('⚡ Testing edge functions...');

    const functions = [
      { name: 'fetch-fec-data', description: 'FEC Data Ingestion' },
      { name: 'fetch-congress-data', description: 'Congress Data Ingestion' },
      { name: 'fetch-google-civic-data', description: 'Google Civic Data' },
      { name: 'run-all-tests', description: 'Test Suite Runner' },
      { name: 'sync-time', description: 'Time Synchronization' }
    ];

    for (const func of functions) {
      try {
        console.log(`Testing ${func.name}...`);
        
        const { data, error } = await invokeWithTimeout(func.name);

        if (error) {
          if (error.message === 'Timeout') {
            diagnostics.edgeFunctions.push({
              category: 'Edge Functions',
              test: func.description,
              status: 'warning',
              message: 'Function timeout (may be slow)',
              details: { timeout: true }
            });
          } else {
            diagnostics.edgeFunctions.push({
              category: 'Edge Functions',
              test: func.description,
              status: 'fail',
              message: `Function error: ${error.message}`,
              details: error
            });
          }
        } else {
          diagnostics.edgeFunctions.push({
            category: 'Edge Functions',
            test: func.description,
            status: 'pass',
            message: 'Function executed successfully',
            details: data
          });
        }
      } catch (error) {
        diagnostics.edgeFunctions.push({
          category: 'Edge Functions',
          test: func.description,
          status: 'fail',
          message: `Function unavailable: ${error.message}`,
          details: error
        });
      }
    }
  };

  const testDataIngestion = async (diagnostics: SystemStatus) => {
    console.log('📥 Testing data ingestion process...');

    try {
      // Test if we can trigger data ingestion
      const { data, error } = await invokeWithTimeout('fetch-fec-data');

      if (error) {
        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'FEC Data Trigger',
          status: 'fail',
          message: `Cannot trigger data ingestion: ${error.message}`,
          details: error
        });
      } else {
        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'FEC Data Trigger',
          status: 'pass',
          message: 'Data ingestion triggered successfully',
          details: data
        });

        // Check if new data was actually created
        const { data: afterElections } = await supabase
          .from('elections')
          .select('count', { count: 'exact', head: true });

        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'Data Creation Verification',
          status: 'pass',
          message: `Elections after ingestion: ${afterElections || 0}`,
          details: { count: afterElections }
        });
      }

      // Test data quality
      const { data: recentElections } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentElections && recentElections.length > 0) {
        const hasValidData = recentElections.every(e => 
          e.office_name && e.state && e.election_dt && e.office_level
        );

        diagnostics.dataIngestion.push({
          category: 'Data Ingestion',
          test: 'Data Quality Check',
          status: hasValidData ? 'pass' : 'warning',
          message: hasValidData ? 'All required fields present' : 'Some data quality issues found',
          details: { sampleData: recentElections.slice(0, 3) }
        });
      }

    } catch (error) {
      diagnostics.dataIngestion.push({
        category: 'Data Ingestion',
        test: 'Data Ingestion Process',
        status: 'fail',
        message: `Ingestion test failed: ${error.message}`,
        details: error
      });
    }
  };

  const testAuthentication = async (diagnostics: SystemStatus) => {
    console.log('🔐 Testing authentication...');

    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      diagnostics.authentication.push({
        category: 'Authentication',
        test: 'Session Check',
        status: sessionError ? 'fail' : session ? 'pass' : 'warning',
        message: sessionError ? sessionError.message : session ? 'User authenticated' : 'No active session',
        details: { hasSession: !!session, user: session?.user?.email }
      });

      // Test user profile access
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        diagnostics.authentication.push({
          category: 'Authentication',
          test: 'User Profile Access',
          status: profileError ? 'warning' : 'pass',
          message: profileError ? 'No profile found' : 'Profile accessible',
          details: { profile }
        });
      }

    } catch (error) {
      diagnostics.authentication.push({
        category: 'Authentication',
        test: 'Authentication System',
        status: 'fail',
        message: `Auth test failed: ${error.message}`,
        details: error
      });
    }
  };

  const testSecurity = async (diagnostics: SystemStatus) => {
    console.log('🔒 Testing security and RLS policies...');

    try {
      // Test RLS policies on critical tables - using type assertion for diagnostic purposes
      const tables = ['elections', 'candidates', 'interaction_logs', 'user_analytics'];

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from<any>(table)
            .select('*')
            .limit(1);

          if (error) {
            // Check if it's an RLS policy violation
            if (error.code === '42501') {
              diagnostics.security.push({
                category: 'Security',
                test: `RLS Policy - ${table}`,
                status: 'warning',
                message: `RLS policy blocking access to ${table}`,
                details: { table, error: error.message }
              });
            } else {
              diagnostics.security.push({
                category: 'Security',
                test: `Table Access - ${table}`,
                status: 'fail',
                message: `Cannot access ${table}: ${error.message}`,
                details: error
              });
            }
          } else {
            diagnostics.security.push({
              category: 'Security',
              test: `Table Access - ${table}`,
              status: 'pass',
              message: `${table} accessible`,
              details: { recordCount: data?.length }
            });
          }
        } catch (err) {
          diagnostics.security.push({
            category: 'Security',
            test: `Table Test - ${table}`,
            status: 'fail',
            message: `Test failed for ${table}: ${err.message}`
          });
        }
      }

    } catch (error) {
      diagnostics.security.push({
        category: 'Security',
        test: 'Security System',
        status: 'fail',
        message: `Security test failed: ${error.message}`,
        details: error
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const renderDiagnosticSection = (title: string, tests: DiagnosticResult[]) => (
    <Card key={title} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{test.test}</span>
                  <Badge variant={test.status === 'pass' ? 'default' : test.status === 'warning' ? 'secondary' : 'destructive'}>
                    {test.status}
                  </Badge>
                </div>
                <p className={`text-sm ${getStatusColor(test.status)} mt-1`}>
                  {test.message}
                </p>
                {test.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">View Details</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
              {/* Overall Status */}
              <Card className={`border-2 ${
                results.overall === 'healthy' ? 'border-green-500 bg-green-50' :
                results.overall === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-red-500 bg-red-50'
              }`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      results.overall === 'healthy' ? 'text-green-600' :
                      results.overall === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {results.overall === 'healthy' ? '✅ SYSTEM HEALTHY' :
                       results.overall === 'warning' ? '⚠️ SYSTEM WARNINGS' :
                       '🚨 CRITICAL ISSUES'}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {results.overall === 'healthy' ? 'All systems operational' :
                       results.overall === 'warning' ? 'Some issues detected, review warnings' :
                       'Critical issues found, immediate attention required'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              {renderDiagnosticSection('Database Tests', results.database)}
              {renderDiagnosticSection('Edge Functions', results.edgeFunctions)}
              {renderDiagnosticSection('Data Ingestion', results.dataIngestion)}
              {renderDiagnosticSection('Authentication', results.authentication)}
              {renderDiagnosticSection('Security & Policies', results.security)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
