
import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { electionCycleService, ElectionCycle } from '@/services/electionCycleService';

interface ElectionCycleSelectorProps {
  selectedCycle?: string;
  onCycleChange: (cycleId: string) => void;
}

export const ElectionCycleSelector: React.FC<ElectionCycleSelectorProps> = ({
  selectedCycle,
  onCycleChange
}) => {
  const [cycles, setCycles] = useState<ElectionCycle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setLoading(true);
        const cyclesData = await electionCycleService.getElectionCycles();
        setCycles(cyclesData);
        
        // Auto-select active cycle if none selected
        if (!selectedCycle && cyclesData.length > 0) {
          const activeCycle = cyclesData.find(c => c.is_active) || cyclesData[0];
          onCycleChange(activeCycle.id);
        }
      } catch (error) {
        console.error('Error fetching election cycles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, [selectedCycle, onCycleChange]);

  const selectedCycleData = cycles.find(c => c.id === selectedCycle);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
        <Calendar className="w-4 h-4 text-white/70" />
        <span className="text-white/70 text-sm">Loading cycles...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 transition-all duration-200"
      >
        <Calendar className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">
          {selectedCycleData?.name || 'Select Election Cycle'}
        </span>
        <span className="sm:hidden">
          {selectedCycleData?.name.split(' ')[0] || 'Cycle'}
        </span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
              <Filter className="w-4 h-4" />
              Election Cycles
            </div>
            
            <div className="mt-2 space-y-1">
              {cycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => {
                    onCycleChange(cycle.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCycle === cycle.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cycle.name}</span>
                    {cycle.is_active && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {cycle.type.charAt(0).toUpperCase() + cycle.type.slice(1)} • {
                      new Date(cycle.start_date).getFullYear()
                    }
                  </div>
                </button>
              ))}
            </div>
            
            {cycles.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No election cycles available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
