
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { comprehensiveElectionService, ElectionDataStatus } from '@/services/comprehensiveElectionService';

interface ComprehensiveDataStatusProps {
  onDataEnsured?: () => void;
}

export const ComprehensiveDataStatus: React.FC<ComprehensiveDataStatusProps> = ({ onDataEnsured }) => {
  const [dataStatus, setDataStatus] = useState<ElectionDataStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnsuring, setIsEnsuring] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const checkDataStatus = async () => {
    setIsLoading(true);
    try {
      const status = await comprehensiveElectionService.verifyDataCompleteness();
      setDataStatus(status);
    } catch (error) {
      console.error('Error checking data status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ensureFullData = async () => {
    setIsEnsuring(true);
    setLastResult(null);
    try {
      const result = await comprehensiveElectionService.ensureComprehensiveData();
      setLastResult(result.message);
      setDataStatus(result.dataStatus);
      
      if (result.success && onDataEnsured) {
        onDataEnsured();
      }
    } catch (error) {
      console.error('Error ensuring full data:', error);
      setLastResult(`Error: ${error.message}`);
    } finally {
      setIsEnsuring(false);
    }
  };

  useEffect(() => {
    checkDataStatus();
  }, []);

  const getCompletionPercentage = () => {
    if (!dataStatus) return 0;
    const targetTotal = 160;
    return Math.min((dataStatus.totalElections / targetTotal) * 100, 100);
  };

  const getStatusColor = (isComplete: boolean) => {
    return isComplete ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isComplete: boolean) => {
    return isComplete ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-6 h-6" />
          <span>Election Data Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-4">
          <Button 
            onClick={checkDataStatus} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Check Status
          </Button>
          
          <Button 
            onClick={ensureFullData} 
            disabled={isEnsuring || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Database className={`w-4 h-4 mr-2 ${isEnsuring ? 'animate-pulse' : ''}`} />
            {isEnsuring ? 'Ensuring Full Data...' : 'Ensure Full Dataset'}
          </Button>
        </div>

        {lastResult && (
          <div className={`p-4 rounded-lg border ${lastResult.includes('Success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-sm ${lastResult.includes('Success') ? 'text-green-700' : 'text-red-700'}`}>
              {lastResult}
            </p>
          </div>
        )}

        {dataStatus && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(dataStatus.isComprehensive)}
                <span className={`font-medium ${getStatusColor(dataStatus.isComprehensive)}`}>
                  {dataStatus.isComprehensive ? 'Dataset Complete' : 'Dataset Incomplete'}
                </span>
              </div>
              <Badge variant={dataStatus.isComprehensive ? "default" : "destructive"}>
                {dataStatus.totalElections} / 160+ elections
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Data Completion</span>
                <span>{Math.round(getCompletionPercentage())}%</span>
              </div>
              <Progress value={getCompletionPercentage()} className="w-full" />
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dataStatus.federalElections}</div>
                <div className="text-sm text-gray-500">Federal</div>
                <div className="text-xs text-gray-400">Target: 50+</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dataStatus.stateElections}</div>
                <div className="text-sm text-gray-500">State</div>
                <div className="text-xs text-gray-400">Target: 50+</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{dataStatus.localElections}</div>
                <div className="text-sm text-gray-500">Local</div>
                <div className="text-xs text-gray-400">Target: 50+</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{dataStatus.upcomingElections}</div>
                <div className="text-sm text-gray-500">Upcoming</div>
                <div className="text-xs text-gray-400">Target: 100+</div>
              </div>
            </div>

            {/* Geographic Coverage */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Geographic Coverage</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {dataStatus.statesCovered.length} states/territories covered
                </span>
                <Badge variant={dataStatus.statesCovered.length >= 51 ? "default" : "secondary"}>
                  {dataStatus.statesCovered.length} / 51+
                </Badge>
              </div>
            </div>

            {/* Missing Requirements */}
            {dataStatus.missingRequirements.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Missing Requirements:</h4>
                <ul className="space-y-1">
                  {dataStatus.missingRequirements.map((requirement, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
