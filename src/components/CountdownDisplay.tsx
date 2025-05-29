
import React from 'react';

interface CountdownDisplayProps {
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  };
  timeUnit: string;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ timeRemaining, timeUnit }) => {
  const formatNumber = (num: number, digits: number = 2) => {
    return num.toString().padStart(digits, '0');
  };

  const getDisplayValue = () => {
    switch (timeUnit) {
      case 'milliseconds':
        return `${formatNumber(timeRemaining.milliseconds, 3)}ms`;
      case 'seconds':
        return `${formatNumber(timeRemaining.seconds)}s`;
      case 'minutes':
        return `${formatNumber(timeRemaining.minutes)}m`;
      case 'hours':
        return `${formatNumber(timeRemaining.hours)}h`;
      case 'days':
        return `${timeRemaining.days}d`;
      default:
        return null;
    }
  };

  const singleDisplay = getDisplayValue();

  if (singleDisplay) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl font-bold text-white mb-2 font-mono">
          {singleDisplay}
        </div>
        <div className="text-white/60 text-xs uppercase tracking-wider">
          {timeUnit}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatNumber(timeRemaining.days)}
          </div>
          <div className="text-white/60 text-xs uppercase tracking-wider">Days</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatNumber(timeRemaining.hours)}
          </div>
          <div className="text-white/60 text-xs uppercase tracking-wider">Hours</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatNumber(timeRemaining.minutes)}
          </div>
          <div className="text-white/60 text-xs uppercase tracking-wider">Mins</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatNumber(timeRemaining.seconds)}
          </div>
          <div className="text-white/60 text-xs uppercase tracking-wider">Secs</div>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-lg font-bold text-white/80 font-mono">
          .{formatNumber(timeRemaining.milliseconds, 3)}
        </div>
        <div className="text-white/50 text-xs uppercase tracking-wider">Milliseconds</div>
      </div>
    </div>
  );
};
