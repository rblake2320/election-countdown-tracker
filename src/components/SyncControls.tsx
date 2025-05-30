
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { electionService } from '@/services/electionService';

interface SyncControlsProps {
  onSyncComplete: () => void;
}

export const SyncControls: React.FC<SyncControlsProps> = ({ onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);

  const syncExternalData = async () => {
    try {
      setSyncing(true);
      
      // Sync FEC and Congress data first
      await electionService.syncFECData();
      
      // Sync detailed Congress data
      await electionService.syncCongressData();
      
      // Then sync Google Civic data
      await electionService.syncGoogleCivicData();
      
      // Notify parent to force refresh
      onSyncComplete();
      
      console.log('All external data sync completed');
    } catch (err) {
      console.error('Error syncing external data:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={syncExternalData}
      disabled={syncing}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      <span>{syncing ? 'Syncing External APIs...' : 'Sync External Data'}</span>
    </button>
  );
};
