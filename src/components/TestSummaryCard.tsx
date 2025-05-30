
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestReport {
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
  };
  status: 'PERFECT' | 'READY' | 'CRITICAL' | 'ERROR';
  message: string;
  score: number;
  timestamp: string;
}

interface TestSummaryCardProps {
  report: TestReport;
}

export const TestSummaryCard: React.FC<TestSummaryCardProps> = ({ report }) => {
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
  );
};
