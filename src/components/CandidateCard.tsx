
import React from 'react';
import { Candidate } from '@/types/election';
import { IntentButton } from './IntentButton';

interface CandidateCardProps {
  candidate: Candidate;
  electionId: string;
  isLeading?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  electionId, 
  isLeading = false 
}) => {
  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democratic': return 'bg-blue-500';
      case 'republican': return 'bg-red-500';
      case 'independent': return 'bg-purple-500';
      case 'green': return 'bg-green-500';
      case 'libertarian': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPartyAbbr = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democratic': return 'D';
      case 'republican': return 'R';
      case 'independent': return 'I';
      case 'green': return 'G';
      case 'libertarian': return 'L';
      default: return party.charAt(0).toUpperCase();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full ${getPartyColor(candidate.party)} flex items-center justify-center text-white text-sm font-bold`}>
          {getPartyAbbr(candidate.party)}
        </div>
        <div>
          <div className="text-white font-medium text-sm">{candidate.name}</div>
          <div className="text-white/60 text-xs">{candidate.party}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-white font-bold text-lg">{candidate.pollingPercentage}%</div>
          {isLeading && (
            <div className="text-green-400 text-xs font-medium">Leading</div>
          )}
        </div>
        
        <IntentButton candidate={candidate} electionId={electionId} />
      </div>
    </div>
  );
};
