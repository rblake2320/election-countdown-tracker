
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 text-red-200">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    </div>
  );
};
