
import { useState, useEffect, useCallback } from 'react';
import { Election } from '@/types/election';
import { realTimeElectionService, RealTimeElectionUpdate } from '@/services/realTimeElectionService';

export const useRealTimeElections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  const handleUpdate = useCallback((data: RealTimeElectionUpdate) => {
    console.log(`Real-time update received: ${data.elections.length} elections`);
    setElections(data.elections);
    setLastUpdated(data.lastUpdated);
    setIsLoading(false);
    setError(null);
  }, []);

  const startRealTime = useCallback(async () => {
    try {
      setIsRealTimeActive(true);
      await realTimeElectionService.startRealTimeUpdates(30000); // 30 second updates
    } catch (err) {
      console.error('Error starting real-time updates:', err);
      setError('Failed to start real-time updates');
    }
  }, []);

  const stopRealTime = useCallback(() => {
    setIsRealTimeActive(false);
    realTimeElectionService.stopRealTimeUpdates();
  }, []);

  const forceRefresh = useCallback(async () => {
    setIsLoading(true);
    await realTimeElectionService.forceRefresh();
  }, []);

  useEffect(() => {
    const unsubscribe = realTimeElectionService.subscribe(handleUpdate);
    
    // Auto-start real-time updates
    startRealTime();

    return () => {
      unsubscribe();
      stopRealTime();
    };
  }, [handleUpdate, startRealTime, stopRealTime]);

  return {
    elections,
    lastUpdated,
    isLoading,
    error,
    isRealTimeActive,
    forceRefresh,
    startRealTime,
    stopRealTime
  };
};
