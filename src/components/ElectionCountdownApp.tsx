
import React, { useState, useEffect } from 'react';
import { ElectionCard } from './ElectionCard';
import { FilterPanel } from './FilterPanel';
import { Header } from './Header';
import { electionsData } from '@/data/electionsData';
import { Election, FilterOptions } from '@/types/election';

export const ElectionCountdownApp = () => {
  const [filteredElections, setFilteredElections] = useState<Election[]>(electionsData);
  const [filters, setFilters] = useState<FilterOptions>({
    party: 'all',
    state: 'all',
    electionType: 'all',
    timeUnit: 'all'
  });

  useEffect(() => {
    let filtered = electionsData;

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
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10">
        <Header />
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
          
          {filteredElections.length === 0 && (
            <div className="text-center py-16">
              <div className="text-white text-xl opacity-75">
                No elections match your current filters
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
