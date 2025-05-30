
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
  electionCycles: number;
  lastSyncAttempt: string | null;
  missingDataSources: string[];
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
        .select('office_level, election_dt');

      const federalElections = allElections?.filter(e => e.office_level === 'Federal').length || 0;
      const stateElections = allElections?.filter(e => e.office_level === 'State').length || 0;
      const localElections = allElections?.filter(e => e.office_level === 'Local').length || 0;
      
      const upcomingElections = allElections?.filter(e => 
        new Date(e.election_dt) > new Date()
      ).length || 0;

      // Get candidates count
      const { count: totalCandidates } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      // Get election cycles
      const { data: cycles } = await supabase
        .from('election_cycles')
        .select('*');

      // Check for missing data sources
      const missingDataSources = [];
      if (federalElections < 20) missingDataSources.push('Federal Elections (FEC data)');
      if (stateElections < 50) missingDataSources.push('State Elections (Ballotpedia data)');
      if (localElections < 50) missingDataSources.push('Local Elections (Google Civic data)');
      if ((totalCandidates || 0) < 300) missingDataSources.push('Candidate Information');

      setDiagnostics({
        totalElections: totalElections || 0,
        federalElections,
        stateElections,
        localElections,
        upcomingElections,
        totalCandidates: totalCandidates || 0,
        electionCycles: cycles?.length || 0,
        lastSyncAttempt: null, // Would need to track this
        missingDataSources
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-6 h-6" />
          <span>Data Ingestion Diagnostics</span>
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
            {isForceReingesting ? 'Re-ingesting...' : 'Force Data Re-ingestion'}
          </Button>
        </div>

        {diagnostics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.totalElections, 150)}`}>
                  {diagnostics.totalElections}
                </div>
                <div className="text-sm text-gray-500">Total Elections</div>
                <div className="text-xs text-gray-400">Expected: 150+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.federalElections, 20)}`}>
                  {diagnostics.federalElections}
                </div>
                <div className="text-sm text-gray-500">Federal</div>
                <div className="text-xs text-gray-400">Expected: 20+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.stateElections, 50)}`}>
                  {diagnostics.stateElections}
                </div>
                <div className="text-sm text-gray-500">State</div>
                <div className="text-xs text-gray-400">Expected: 50+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.localElections, 50)}`}>
                  {diagnostics.localElections}
                </div>
                <div className="text-sm text-gray-500">Local</div>
                <div className="text-xs text-gray-400">Expected: 50+</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.upcomingElections, 50)}`}>
                  {diagnostics.upcomingElections}
                </div>
                <div className="text-sm text-gray-500">Upcoming Elections</div>
                <div className="text-xs text-gray-400">Expected: 50+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.totalCandidates, 300)}`}>
                  {diagnostics.totalCandidates}
                </div>
                <div className="text-sm text-gray-500">Total Candidates</div>
                <div className="text-xs text-gray-400">Expected: 300+</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getSeverityColor(diagnostics.electionCycles, 3)}`}>
                  {diagnostics.electionCycles}
                </div>
                <div className="text-sm text-gray-500">Election Cycles</div>
                <div className="text-xs text-gray-400">Expected: 3+</div>
              </div>
            </div>

            {diagnostics.missingDataSources.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Missing Data Sources</span>
                </div>
                <div className="space-y-2">
                  {diagnostics.missingDataSources.map((source, index) => (
                    <Badge key={index} variant="destructive" className="mr-2">
                      {source}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-red-700 mt-3">
                  These data sources appear to be missing or incomplete. The platform needs comprehensive data ingestion to be launch-ready.
                </p>
              </div>
            )}

            {diagnostics.totalElections < 150 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Platform Not Launch Ready</h4>
                <p className="text-sm text-yellow-700">
                  With only {diagnostics.totalElections} elections, the platform lacks the comprehensive coverage needed for launch. 
                  A minimum of 150+ elections across federal, state, and local levels is required for a meaningful user experience.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
