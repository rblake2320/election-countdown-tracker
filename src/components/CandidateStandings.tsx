
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Candidate } from '@/types/election';
import { CandidateCard } from './CandidateCard';

interface CandidateStandingsProps {
  candidates: Candidate[];
  electionId: string;
}

export const CandidateStandings: React.FC<CandidateStandingsProps> = ({ candidates, electionId }) => {
  // Sort candidates by polling percentage (descending)
  const sortedCandidates = [...candidates].sort((a, b) => b.pollingPercentage - a.pollingPercentage);

  return (
    <div className="space-y-2">
      {sortedCandidates.map((candidate, index) => (
        <CandidateCard 
          key={`${candidate.name}-${candidate.party}`}
          candidate={candidate}
          electionId={electionId}
          isLeading={index === 0}
        />
      ))}
    </div>
  );
};
