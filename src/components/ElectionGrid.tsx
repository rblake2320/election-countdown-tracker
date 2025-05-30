
import React from 'react';
import { ElectionCard } from './ElectionCard';
import { Election } from '@/types/election';

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
        <div className="text-white text-xl opacity-75">
          No elections match your current filters
        </div>
        <button
          onClick={onSyncData}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Sync Election Data
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {elections.map((election) => (
        <ElectionCard 
          key={election.id} 
          election={election}
          timeUnit={timeUnit}
        />
      ))}
    </div>
  );
};
