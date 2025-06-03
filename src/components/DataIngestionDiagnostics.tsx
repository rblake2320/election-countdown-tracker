
import React, { useState } from 'react';
import { Database, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { electionService } from '@/services/electionService';
import { supabase } from '@/integrations/supabase/client';

interface DataDiagnostics {
  totalElections: number;
  federalElections: number;
  stateElections: number;
  localElections: number;
  upcomingElections: number;
  totalCandidates: number;
  statesCovered: number;
  missingStates: string[];
  lastSyncAttempt: string | null;
  isLaunchReady: boolean;
}

export const DataIngestionDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DataDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForceReingesting, setIsForceReingesting] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      // Get total elections
      const { count: totalElections } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true });

      // Get elections by level
      const { data: allElections } = await supabase
        .from('elections')
        .select('office_level, election_dt, state');

      const federalElections = allElections?.filter(e => e.office_level === 'Federal').length || 0;
      const stateElections = allElections?.filter(e => e.office_level === 'State').length || 0;
      const localElections = allElections?.filter(e => e.office_level === 'Local').length || 0;
      
      const upcomingElections = allElections?.filter(e => 
        new Date(e.election_dt) > new Date()
      ).length || 0;

      // Check state coverage
      const uniqueStates = [...new Set(allElections?.map(e => e.state) || [])];
      const requiredStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
      ];
      const missingStates = requiredStates.filter(state => !uniqueStates.includes(state));

      // Get candidates count
      const { count: totalCandidates } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      // Determine launch readiness
      const MINIMUM_REQUIRED = 160;
      const isLaunchReady = (totalElections || 0) >= MINIMUM_REQUIRED && 
                           upcomingElections >= 100 && 
                           missingStates.length === 0;

      setDiagnostics({
        totalElections: totalElections || 0,
        federalElections,
        stateElections,
        localElections,
        upcomingElections,
        totalCandidates: totalCandidates || 0,
        statesCovered: uniqueStates.length,
        missingStates,
        lastSyncAttempt: null,
        isLaunchReady
      });
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceReingestData = async () => {
    setIsForceReingesting(true);
    try {
      console.log('Starting comprehensive data re-ingestion...');
      
      // Trigger all data sync functions
      await electionService.syncFECData();
      await electionService.syncCongressData();
      await electionService.syncGoogleCivicData();
      
      // Re-run diagnostics after ingestion
      await runDiagnostics();
      
    } catch (error) {
      console.error('Error during data re-ingestion:', error);
    } finally {
      setIsForceReingesting(false);
    }
  };

  const getSeverityColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLaunchReadinessColor = (isReady: boolean) => {
    return isReady ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-6 h-6" />
          <span>Launch Readiness Diagnostics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </Button>
          
          <Button 
            onClick={forceReingestData} 
            disabled={isForceReingesting}
            variant="destructive"
          >
            <ExternalLink className={`w-4 h-4 mr-2 ${isForceReingesting ? 'animate-spin' : ''}`} />
            {isForceReingesting ? 'Creating Elections...' : 'Generate Comprehensive Data'}
          </Button>
        </div>

        {diagnostics && (
          <div className="space-y-6">
            {/* Launch Readiness Status */}
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2">
              <div className={`text-3xl font-bold ${getLaunchReadinessColor(diagnostics.isLaunchReady)}`}>
                {diagnostics.isLaunchReady ? '🚀 LAUNCH READY' : '❌ NOT LAUNCH READY'}
              </div>
              <div className="text-lg text-gray-600 mt-2">
                {diagnostics.isLaunchReady 
                  ? 'Platform meets all requirements for launch'
                  : 'Platform requires more election data before launch'
                }
              </div>
            </div>

            {/* Critical Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${getSeverityColor(diagnostics.totalElections, 160)}`}>
                  {diagnostics.totalElections}
                </div>
                <div className="text-sm text-gray-500">Total Elections</div>
                <div className="text-xs text-gray-400">Required: 160+</div>
                {diagnostics.totalElections < 160 && (
                  <div className="text-xs text-red-500 font-medium">
                    Need {160 - diagnostics.totalElections} more
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${getSeverityColor(diagnostics.upcomingElections, 100)}`}>
                  {diagnostics.upcomingElections}
                </div>
                <div className="text-sm text-gray-500">Upcoming Elections</div>
                <div className="text-xs text-gray-400">Required: 100+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${getSeverityColor(diagnostics.statesCovered, 51)}`}>
                  {diagnostics.statesCovered}
                </div>
                <div className="text-sm text-gray-500">States/Territories</div>
                <div className="text-xs text-gray-400">Required: 51+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${getSeverityColor(diagnostics.totalCandidates, 100)}`}>
                  {diagnostics.totalCandidates}
                </div>
                <div className="text-sm text-gray-500">Total Candidates</div>
                <div className="text-xs text-gray-400">Target: 100+</div>
              </div>
            </div>

            {/* Breakdown by Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.federalElections, 50)}`}>
                  {diagnostics.federalElections}
                </div>
                <div className="text-sm text-gray-500">Federal Elections</div>
                <div className="text-xs text-gray-400">Target: 50+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.stateElections, 50)}`}>
                  {diagnostics.stateElections}
                </div>
                <div className="text-sm text-gray-500">State Elections</div>
                <div className="text-xs text-gray-400">Target: 50+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.localElections, 50)}`}>
                  {diagnostics.localElections}
                </div>
                <div className="text-sm text-gray-500">Local Elections</div>
                <div className="text-xs text-gray-400">Target: 50+</div>
              </div>
            </div>

            {/* Missing States Warning */}
            {diagnostics.missingStates.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Missing State Coverage</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    Elections missing for {diagnostics.missingStates.length} states/territories:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {diagnostics.missingStates.map((state, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Insufficient Data Warning */}
            {diagnostics.totalElections < 160 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">CRITICAL: Platform Not Launch Ready</h4>
                <p className="text-sm text-red-700">
                  With only {diagnostics.totalElections} elections, the platform is far below the required 160+ elections 
                  needed for comprehensive coverage of all 50 states, DC, and territories. This must be resolved before launch.
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Click "Generate Comprehensive Data" to create the required election coverage.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
