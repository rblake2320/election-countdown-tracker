
import { useState, useEffect } from 'react';
import { Election, FilterOptions } from '@/types/election';

export const useElectionFiltering = (elections: Election[]) => {
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    party: 'all',
    state: 'all',
    electionType: 'all',
    timeUnit: 'all'
  });

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

  return {
    filteredElections,
    filters,
    setFilters
  };
};
