
import React, { useState, useEffect } from 'react';
import { ElectionCard } from './ElectionCard';
import { FilterPanel } from './FilterPanel';
import { Header } from './Header';
import { Election, FilterOptions } from '@/types/election';
import { electionService } from '@/services/electionService';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export const ElectionCountdownApp = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    party: 'all',
    state: 'all',
    electionType: 'all',
    timeUnit: 'all'
  });

  // Load elections from database
  const loadElections = async () => {
    try {
      setLoading(true);
      setError(null);
      const electionData = await electionService.fetchElections();
      setElections(electionData);
      console.log(`Loaded ${electionData.length} elections from database`);
    } catch (err) {
      console.error('Error loading elections:', err);
      setError('Failed to load elections. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Sync data from external APIs
  const syncExternalData = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      // Sync FEC and Congress data first
      await electionService.syncFECData();
      
      // Sync detailed Congress data
      await electionService.syncCongressData();
      
      // Then sync Google Civic data
      await electionService.syncGoogleCivicData();
      
      // Reload elections after sync
      await loadElections();
      
      console.log('All external data sync completed');
    } catch (err) {
      console.error('Error syncing external data:', err);
      setError('Failed to sync data from external sources. Using cached data.');
    } finally {
      setSyncing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadElections();
  }, []);

  // Filter elections based on current filters
  useEffect(() => {
    let filtered = elections;

    if (filters.party !== 'all') {
      filtered = filtered.filter(election => 
        election.candidates?.some(candidate => 
          candidate.party.toLowerCase() === filters.party
        )
      );
    }

    if (filters.state !== 'all') {
      filtered = filtered.filter(election => 
        election.state.toLowerCase() === filters.state
      );
    }

    if (filters.electionType !== 'all') {
      filtered = filtered.filter(election => 
        election.type.toLowerCase().includes(filters.electionType)
      );
    }

    setFilteredElections(filtered);
  }, [elections, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Data sync controls */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={syncExternalData}
                disabled={syncing}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync All Election Data'}</span>
              </button>
              
              <button
                onClick={loadElections}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="text-white/70 text-sm">
              {elections.length} elections loaded
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredElections.map((election) => (
              <ElectionCard 
                key={election.id} 
                election={election}
                timeUnit={filters.timeUnit}
              />
            ))}
          </div>
          
          {filteredElections.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-white text-xl opacity-75">
                {elections.length === 0 
                  ? 'No elections found. Try syncing data from external sources.'
                  : 'No elections match your current filters'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
