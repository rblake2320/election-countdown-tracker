
import React from 'react';
import { ElectionCard } from './ElectionCard';
import { Election } from '@/types/election';
import { AlertTriangle, Database } from 'lucide-react';

interface ElectionGridProps {
  elections: Election[];
  timeUnit: string;
  onSyncData: () => void;
}

export const ElectionGrid: React.FC<ElectionGridProps> = ({ 
  elections, 
  timeUnit, 
  onSyncData 
}) => {
  if (elections.length === 0) {
    return (
      <div className="text-center py-16">
        <Database className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <div className="text-white text-xl opacity-75 mb-2">
          No elections match your current filters
        </div>
        <p className="text-white/60 text-sm mb-6">
          Try adjusting your filters or sync new election data
        </p>
        <button
          onClick={onSyncData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Sync Election Data
        </button>
      </div>
    );
  }

  // Show warning if we have some elections but not enough
  const showInsufficientDataWarning = elections.length > 0 && elections.length < 100;

  return (
    <div className="space-y-6">
      {showInsufficientDataWarning && (
        <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Limited Election Data</span>
          </div>
          <p className="text-yellow-200 text-sm mt-1">
            Showing {elections.length} elections. For comprehensive coverage, generate the full dataset using the controls above.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {elections.map((election) => (
          <ElectionCard 
            key={election.id} 
            election={election}
            timeUnit={timeUnit}
          />
        ))}
      </div>
      
      {elections.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-white/60 text-sm">
            Displaying {elections.length} elections • Last updated: {new Date().toLocaleTimeString()}
          </p>
          {elections.length >= 160 && (
            <p className="text-green-400 text-sm mt-1">
              ✅ Comprehensive election coverage active
            </p>
          )}
        </div>
      )}
    </div>
  );
};
