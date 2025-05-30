
import React from 'react';
import { Vote, Settings, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="relative z-20 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Vote className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Election Countdown</h1>
              <p className="text-white/70 text-sm">Real-time election tracking</p>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/test-suite"
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <TestTube className="w-5 h-5" />
              <span>Test Suite</span>
            </Link>
            
            <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
