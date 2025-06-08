
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Bug } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiagnosticResult } from '@/types/diagnostics';

interface DiagnosticSectionProps {
  title: string;
  tests: DiagnosticResult[];
}

export const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({ title, tests }) => {
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

  return (
    <Card className="mb-4">
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
};
