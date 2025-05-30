
import React from 'react';
import { Play, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestExecutionButtonProps {
  isRunning: boolean;
  error: string | null;
  onRunTests: () => void;
}

export const TestExecutionButton: React.FC<TestExecutionButtonProps> = ({ 
  isRunning, 
  error, 
  onRunTests 
}) => {
  return (
    <>
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
            onClick={onRunTests} 
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
    </>
  );
};
