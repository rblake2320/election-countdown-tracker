
import React from 'react';
import { Vote, Calendar, Users } from 'lucide-react';

export const Header = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-white/10 to-blue-600/20"></div>
      
      <div className="relative container mx-auto px-4 py-12 text-center">
        <div className="flex justify-center items-center mb-6">
          <Vote className="w-16 h-16 text-white mr-4 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Election
            <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
              Countdown
            </span>
          </h1>
        </div>
        
        <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
          Track every upcoming U.S. election in real-time. From federal races to local contests, 
          stay informed about candidates, standings, and exact time remaining until Election Day.
        </p>
        
        <div className="flex justify-center space-x-8 text-white/70">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            <span>Real-time Countdowns</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span>Candidate Tracking</span>
          </div>
          <div className="flex items-center">
            <Vote className="w-5 h-5 mr-2" />
            <span>Live Standings</span>
          </div>
        </div>
      </div>
    </header>
  );
};
