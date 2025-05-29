
import React from 'react';
import { Filter, MapPin, Users, Calendar } from 'lucide-react';
import { FilterOptions } from '@/types/election';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const states = [
    'all', 'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 
    'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois',
    'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
    'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana',
    'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york',
    'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
    'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah',
    'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming'
  ];

  const electionTypes = ['all', 'primary', 'general', 'special', 'runoff', 'local'];
  const parties = ['all', 'democratic', 'republican', 'independent', 'green', 'libertarian'];
  const timeUnits = ['all', 'milliseconds', 'seconds', 'minutes', 'hours', 'days'];

  return (
    <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-white mr-2" />
          <h3 className="text-white font-semibold">Filter Elections</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-white/80 text-sm mb-2 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Party
            </label>
            <select
              value={filters.party}
              onChange={(e) => onFiltersChange({ ...filters, party: e.target.value })}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {parties.map(party => (
                <option key={party} value={party} className="text-black">
                  {party.charAt(0).toUpperCase() + party.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white/80 text-sm mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              State
            </label>
            <select
              value={filters.state}
              onChange={(e) => onFiltersChange({ ...filters, state: e.target.value })}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {states.map(state => (
                <option key={state} value={state} className="text-black">
                  {state.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white/80 text-sm mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Election Type
            </label>
            <select
              value={filters.electionType}
              onChange={(e) => onFiltersChange({ ...filters, electionType: e.target.value })}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {electionTypes.map(type => (
                <option key={type} value={type} className="text-black">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-white/80 text-sm mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              Time Display
            </label>
            <select
              value={filters.timeUnit}
              onChange={(e) => onFiltersChange({ ...filters, timeUnit: e.target.value })}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {timeUnits.map(unit => (
                <option key={unit} value={unit} className="text-black">
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
