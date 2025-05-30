
import React from 'react';
import { Zap, RefreshCw, Clock } from 'lucide-react';

interface RealTimeControlsProps {
  isRealTimeActive: boolean;
  isLoading: boolean;
  lastUpdated: string;
  electionsCount: number;
  onForceRefresh: () => void;
  onToggleRealTime: () => void;
}

export const RealTimeControls: React.FC<RealTimeControlsProps> = ({
  isRealTimeActive,
  isLoading,
  lastUpdated,
  electionsCount,
  onForceRefresh,
  onToggleRealTime
}) => {
  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onForceRefresh}
        disabled={isLoading}
        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Force Refresh</span>
      </button>

      <button
        onClick={onToggleRealTime}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isRealTimeActive 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-gray-600 hover:bg-gray-700 text-white'
        }`}
      >
        <Zap className={`w-4 h-4 ${isRealTimeActive ? 'animate-pulse' : ''}`} />
        <span>{isRealTimeActive ? 'Real-time ON' : 'Real-time OFF'}</span>
      </button>

      <div className="flex items-center space-x-4 text-white/70 text-sm">
        <div className="flex items-center space-x-2">
          <span>{electionsCount} elections loaded</span>
          {isRealTimeActive && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </div>
        {lastUpdated && (
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Updated {formatLastUpdated(lastUpdated)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
