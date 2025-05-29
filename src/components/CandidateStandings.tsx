
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Candidate } from '@/types/election';

interface CandidateStandingsProps {
  candidates: Candidate[];
}

export const CandidateStandings: React.FC<CandidateStandingsProps> = ({ candidates }) => {
  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democratic': return 'text-blue-400';
      case 'republican': return 'text-red-400';
      case 'independent': return 'text-purple-400';
      case 'green': return 'text-green-400';
      case 'libertarian': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getPartyBg = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democratic': return 'bg-blue-500/20';
      case 'republican': return 'bg-red-500/20';
      case 'independent': return 'bg-purple-500/20';
      case 'green': return 'bg-green-500/20';
      case 'libertarian': return 'bg-yellow-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-400" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  // Sort candidates by polling percentage (descending)
  const sortedCandidates = [...candidates].sort((a, b) => b.pollingPercentage - a.pollingPercentage);

  return (
    <div className="space-y-2">
      {sortedCandidates.map((candidate, index) => (
        <div key={`${candidate.name}-${candidate.party}`} className={`${getPartyBg(candidate.party)} rounded-lg p-3 border border-white/10`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-white/60 text-xs mr-2">#{index + 1}</span>
              <span className="text-white font-medium text-sm">{candidate.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(candidate.trend)}
              <span className="text-white font-bold">{candidate.pollingPercentage}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${getPartyColor(candidate.party)}`}>
              {candidate.party}
            </span>
            {candidate.endorsements && candidate.endorsements > 0 && (
              <span className="text-white/60 text-xs">
                {candidate.endorsements} endorsements
              </span>
            )}
          </div>
          
          {/* Progress bar for polling percentage */}
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                candidate.party.toLowerCase() === 'democratic' ? 'bg-blue-400' :
                candidate.party.toLowerCase() === 'republican' ? 'bg-red-400' :
                candidate.party.toLowerCase() === 'independent' ? 'bg-purple-400' :
                candidate.party.toLowerCase() === 'green' ? 'bg-green-400' :
                candidate.party.toLowerCase() === 'libertarian' ? 'bg-yellow-400' :
                'bg-gray-400'
              }`}
              style={{ width: `${candidate.pollingPercentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
