
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface OverallStatusCardProps {
  status: 'healthy' | 'warning' | 'critical';
}

export const OverallStatusCard: React.FC<OverallStatusCardProps> = ({ status }) => {
  return (
    <Card className={`border-2 ${
      status === 'healthy' ? 'border-green-500 bg-green-50' :
      status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
      'border-red-500 bg-red-50'
    }`}>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            status === 'healthy' ? 'text-green-600' :
            status === 'warning' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {status === 'healthy' ? '✅ SYSTEM HEALTHY' :
             status === 'warning' ? '⚠️ SYSTEM WARNINGS' :
             '🚨 CRITICAL ISSUES'}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {status === 'healthy' ? 'All systems operational' :
             status === 'warning' ? 'Some issues detected, review warnings' :
             'Critical issues found, immediate attention required'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
