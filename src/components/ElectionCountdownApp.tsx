
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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
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
