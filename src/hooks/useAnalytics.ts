
import { useState, useEffect, useCallback } from 'react';
import { analyticsService, InteractionLog, EngagementMetrics } from '@/services/analyticsService';

export const useAnalytics = () => {
  const [sessionId] = useState(() => analyticsService.generateSessionId());
  const [pageStartTime] = useState(() => Date.now());
  const [interactionCount, setInteractionCount] = useState(0);
  const [scrollDepth, setScrollDepth] = useState(0);

  // Log page view on mount
  useEffect(() => {
    analyticsService.logInteraction({
      session_id: sessionId,
      event_type: 'page_view',
      event_data: {
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.pageYOffset;
      const depth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      setScrollDepth(Math.max(scrollDepth, depth));
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      // Log session end
      const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
      analyticsService.updateEngagementMetrics({
        session_id: sessionId,
        time_spent: timeSpent,
        interactions_count: interactionCount,
        scroll_depth: scrollDepth
      });
    };
  }, [sessionId, pageStartTime, interactionCount, scrollDepth]);

  const logEvent = useCallback((eventType: string, eventData?: Record<string, any>) => {
    analyticsService.logInteraction({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData
    });
    setInteractionCount(prev => prev + 1);
  }, [sessionId]);

  const logElectionInteraction = useCallback((electionId: string, interactionType: string, data?: Record<string, any>) => {
    analyticsService.logInteraction({
      session_id: sessionId,
      event_type: 'election_interaction',
      event_data: {
        election_id: electionId,
        interaction_type: interactionType,
        ...data
      }
    });
    setInteractionCount(prev => prev + 1);
  }, [sessionId]);

  const updateEngagementForElection = useCallback((electionId: string, additionalMetrics?: Partial<EngagementMetrics>) => {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    
    analyticsService.updateEngagementMetrics({
      session_id: sessionId,
      election_id: electionId,
      time_spent: timeSpent,
      interactions_count: interactionCount,
      scroll_depth: scrollDepth,
      ...additionalMetrics
    });
  }, [sessionId, pageStartTime, interactionCount, scrollDepth]);

  return {
    sessionId,
    logEvent,
    logElectionInteraction,
    updateEngagementForElection,
    interactionCount,
    scrollDepth
  };
};
