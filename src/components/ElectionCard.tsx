
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, TrendingUp, Clock } from 'lucide-react';
import { Election } from '@/types/election';
import { CountdownDisplay } from './CountdownDisplay';
import { CandidateStandings } from './CandidateStandings';

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

    const interval = setInterval(updateCountdown, 10); // Update every 10ms for smooth millisecond display
    updateCountdown();

    return () => clearInterval(interval);
  }, [election.date]);

  const getElectionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'primary': return 'from-green-500 to-emerald-600';
      case 'general': return 'from-blue-500 to-indigo-600';
      case 'special': return 'from-orange-500 to-red-600';
      case 'runoff': return 'from-purple-500 to-violet-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const isPastElection = new Date(election.date).getTime() < new Date().getTime();

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

        <div className="text-white/80 text-sm mb-4 line-clamp-2">
          {election.description}
        </div>

        {!isPastElection && (
          <CountdownDisplay 
            timeRemaining={timeRemaining} 
            timeUnit={timeUnit}
          />
        )}

        {isPastElection && (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-white/50 mx-auto mb-2" />
            <span className="text-white/50 text-sm">Election Completed</span>
          </div>
        )}

        {election.candidates && election.candidates.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center text-white/80 text-sm mb-3">
              <Users className="w-4 h-4 mr-2" />
              Candidates ({election.candidates.length})
            </div>
            <CandidateStandings candidates={election.candidates} />
          </div>
        )}

        {election.keyRaces && election.keyRaces.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center text-white/80 text-sm mb-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Key Races
            </div>
            <div className="text-white/70 text-xs">
              {election.keyRaces.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
