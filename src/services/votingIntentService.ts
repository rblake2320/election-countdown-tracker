
import { supabase } from '@/integrations/supabase/client';

export const votingIntentService = {
  async getUserVotingIntents(userId: string) {
    try {
      const { data, error } = await supabase
        .from('votes_intent')
        .select('*')
        .eq('user_uid', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user voting intents:', error);
      return [];
    }
  },

  async addVotingIntent(candidateId: string, userId: string, weight: number = 1) {
    try {
      const { data, error } = await supabase
        .from('votes_intent')
        .insert({
          candidate_id: candidateId,
          user_uid: userId,
          weight
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding voting intent:', error);
      throw error;
    }
  },

  async removeVotingIntent(candidateId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('votes_intent')
        .delete()
        .match({ 
          candidate_id: candidateId,
          user_uid: userId 
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing voting intent:', error);
      throw error;
    }
  },

  async getCandidateIntentCounts(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('votes_intent')
        .select('weight')
        .eq('candidate_id', candidateId);

      if (error) throw error;
      
      const totalIntents = data?.reduce((sum, intent) => sum + (intent.weight || 1), 0) || 0;
      return {
        totalIntents,
        intentCount: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching candidate intent counts:', error);
      return { totalIntents: 0, intentCount: 0 };
    }
  }
};
