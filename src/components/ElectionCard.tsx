import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, TrendingUp, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Election } from '@/types/election';
import { CountdownDisplay } from './CountdownDisplay';
import { CandidateCard } from './CandidateCard';

interface ElectionCardProps {
  election: Election;
  timeUnit: string;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({ election, timeUnit }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

  const [showAllCandidates, setShowAllCandidates] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const electionTime = new Date(election.date).getTime();
      const difference = electionTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const milliseconds = difference % 1000;

        setTimeRemaining({ days, hours, minutes, seconds, milliseconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
      }
    };

    const interval = setInterval(updateCountdown, 10);
    updateCountdown();

    return () => clearInterval(interval);
  }, [election.date]);

  const getElectionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'primary': return 'from-green-500 to-emerald-600';
      case 'general': return 'from-blue-500 to-indigo-600';
      case 'special': return 'from-orange-500 to-red-600';
      case 'runoff': return 'from-purple-500 to-violet-600';
      case 'federal': return 'from-blue-600 to-indigo-700';
      case 'state': return 'from-green-600 to-emerald-700';
      case 'local': return 'from-orange-600 to-red-700';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const isPastElection = new Date(election.date).getTime() < new Date().getTime();
  const sortedCandidates = election.candidates ? [...election.candidates].sort((a, b) => b.pollingPercentage - a.pollingPercentage) : [];
  const topCandidates = sortedCandidates.slice(0, 2);
  const remainingCandidates = sortedCandidates.slice(2);

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-white/15 ${isPastElection ? 'opacity-60' : ''}`}>
      <div className={`h-2 bg-gradient-to-r ${getElectionTypeColor(election.type)}`}></div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getElectionTypeColor(election.type)} text-white`}>
            {election.type}
          </span>
          <div className="flex items-center text-white/70 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            {election.state}
          </div>
        </div>

        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
          {election.title}
        </h3>

        <div className="flex items-center text-white/70 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(election.date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>

        {!isPastElection && (
          <CountdownDisplay 
            timeRemaining={timeRemaining} 
            timeUnit={timeUnit}
          />
        )}

        {isPastElection && (
          <div className="text-center py-4 mb-4">
            <Clock className="w-8 h-8 text-white/50 mx-auto mb-2" />
            <span className="text-white/50 text-sm">Election Completed</span>
          </div>
        )}

        {/* Key Candidates Section */}
        {sortedCandidates.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-white/80 text-sm mb-3">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Key Candidates
              </div>
              <span className="text-white/60">
                {sortedCandidates.length} running
              </span>
            </div>
            
            <div className="space-y-2">
              {topCandidates.map((candidate, index) => (
                <CandidateCard 
                  key={`${candidate.name}-${candidate.party}`}
                  candidate={candidate}
                  electionId={election.id}
                  isLeading={index === 0}
                />
              ))}
              
              {remainingCandidates.length > 0 && (
                <>
                  {showAllCandidates && remainingCandidates.map((candidate) => (
                    <CandidateCard 
                      key={`${candidate.name}-${candidate.party}`}
                      candidate={candidate}
                      electionId={election.id}
                    />
                  ))}
                  
                  <button
                    onClick={() => setShowAllCandidates(!showAllCandidates)}
                    className="w-full flex items-center justify-center space-x-2 text-white/60 hover:text-white/80 text-sm py-2 transition-colors"
                  >
                    <span>
                      {showAllCandidates ? 'Show Less' : `Show ${remainingCandidates.length} More`}
                    </span>
                    {showAllCandidates ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {election.keyRaces && election.keyRaces.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center text-white/80 text-sm mb-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Offices on Ballot
            </div>
            <div className="flex flex-wrap gap-2">
              {election.keyRaces.map((race, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs"
                >
                  {race}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
