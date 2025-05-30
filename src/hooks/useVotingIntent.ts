
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { votingIntentService } from '@/services/votingIntentService';

export const useVotingIntent = (candidateId: string) => {
  const [hasIntent, setHasIntent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndIntent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Check if user already has intent for this candidate
        const intents = await votingIntentService.getUserVotingIntents(user.id);
        const existingIntent = intents.find(intent => intent.candidate_id === candidateId);
        setHasIntent(!!existingIntent);
      }
    };

    checkAuthAndIntent();
  }, [candidateId]);

  const toggleIntent = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      
      if (hasIntent) {
        await votingIntentService.removeVotingIntent(candidateId, userId);
        setHasIntent(false);
      } else {
        await votingIntentService.addVotingIntent(candidateId, userId);
        setHasIntent(true);
      }
    } catch (error) {
      console.error('Error toggling voting intent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasIntent,
    isLoading,
    toggleIntent,
    isAuthenticated: !!userId
  };
};
