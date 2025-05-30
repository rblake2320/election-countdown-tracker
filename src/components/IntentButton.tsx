
import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Candidate } from '@/types/election';

interface IntentButtonProps {
  candidate: Candidate;
  electionId: string;
}

export const IntentButton: React.FC<IntentButtonProps> = ({ candidate, electionId }) => {
  const [hasIntent, setHasIntent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleIntentClick = async () => {
    try {
      setIsLoading(true);
      
      if (hasIntent) {
        // Remove intent - find and delete the record
        const { error } = await supabase
          .from('votes_intent')
          .delete()
          .match({ 
            candidate_id: `${candidate.name}-${electionId}`, // Using composite key since we don't have actual candidate IDs
            user_uid: (await supabase.auth.getUser()).data.user?.id 
          });

        if (error) {
          console.error('Error removing voting intent:', error);
          return;
        }

        setHasIntent(false);
      } else {
        // Add intent
        const { error } = await supabase
          .from('votes_intent')
          .insert({
            candidate_id: `${candidate.name}-${electionId}`, // Using composite key since we don't have actual candidate IDs
            user_uid: (await supabase.auth.getUser()).data.user?.id,
            weight: 1
          });

        if (error) {
          console.error('Error adding voting intent:', error);
          return;
        }

        setHasIntent(true);
      }
    } catch (error) {
      console.error('Error handling voting intent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleIntentClick}
      disabled={isLoading}
      className={`
        flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all
        ${hasIntent 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-white/20 text-white/80 hover:bg-white/30'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {hasIntent ? (
        <>
          <Check className="w-3 h-3" />
          <span>Support</span>
        </>
      ) : (
        <>
          <Heart className="w-3 h-3" />
          <span>Support</span>
        </>
      )}
    </button>
  );
};
