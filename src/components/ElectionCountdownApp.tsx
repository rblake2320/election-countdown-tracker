
import React from 'react';
import { FilterPanel } from './FilterPanel';
import { Header } from './Header';
import { ElectionGrid } from './ElectionGrid';
import { RealTimeControls } from './RealTimeControls';
import { SyncControls } from './SyncControls';
import { ErrorDisplay } from './ErrorDisplay';
import { useRealTimeElections } from '@/hooks/useRealTimeElections';
import { useElectionFiltering } from '@/hooks/useElectionFiltering';
import { Loader2 } from 'lucide-react';

export const ElectionCountdownApp = () => {
  const {
    elections,
    lastUpdated,
    isLoading,
    error,
    isRealTimeActive,
    forceRefresh,
    startRealTime,
    stopRealTime
  } = useRealTimeElections();

  const { filteredElections, filters, setFilters } = useElectionFiltering(elections);

  const handleSyncComplete = async () => {
    await forceRefresh();
  };

  const handleToggleRealTime = () => {
    if (isRealTimeActive) {
      stopRealTime();
    } else {
      startRealTime();
    }
  };

  if (isLoading && elections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading real-time election data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <SyncControls onSyncComplete={handleSyncComplete} />
              <RealTimeControls
                isRealTimeActive={isRealTimeActive}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
                electionsCount={elections.length}
                onForceRefresh={forceRefresh}
                onToggleRealTime={handleToggleRealTime}
              />
            </div>
          </div>
          
          {error && <ErrorDisplay error={error} />}
        </div>

        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        
        <div className="container mx-auto px-4 py-8">
          <ElectionGrid 
            elections={filteredElections}
            timeUnit={filters.timeUnit}
            onSyncData={handleSyncComplete}
          />
        </div>
      </div>
    </div>
  );
};
