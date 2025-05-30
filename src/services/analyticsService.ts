
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface InteractionLog {
  id?: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_data?: Json;
  page_url?: string;
  timestamp?: string;
  ip_address?: unknown;
  user_agent?: string;
}

export interface EngagementMetrics {
  id?: string;
  user_id?: string;
  session_id?: string;
  election_id?: string;
  time_spent?: number;
  interactions_count?: number;
  scroll_depth?: number;
  shares_count?: number;
  created_at?: string;
}

export interface UserPreferences {
  id?: string;
  user_id?: string;
  political_affiliation?: string;
  interests?: string[];
  notification_settings?: Json;
  privacy_consent?: boolean;
  analytics_consent?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserDemographics {
  id?: string;
  user_id?: string;
  age_range?: string;
  state?: string;
  district?: string;
  registration_status?: string;
  created_at?: string;
  updated_at?: string;
}

export const analyticsService = {
  // Session management
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Interaction logging
  async logInteraction(interaction: Omit<InteractionLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logData: InteractionLog = {
        ...interaction,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href
      };

      const { error } = await supabase
        .from('interaction_logs')
        .insert(logData);

      if (error) {
        console.error('Error logging interaction:', error);
      }
    } catch (error) {
      console.error('Error in logInteraction:', error);
    }
  },

  // Engagement metrics
  async updateEngagementMetrics(metrics: Omit<EngagementMetrics, 'id' | 'created_at'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('engagement_metrics')
        .upsert({
          ...metrics,
          user_id: user.id
        });

      if (error) {
        console.error('Error updating engagement metrics:', error);
      }
    } catch (error) {
      console.error('Error in updateEngagementMetrics:', error);
    }
  },

  // User preferences
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  },

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user preferences:', error);
      }
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
    }
  },

  // User demographics
  async getUserDemographics(): Promise<UserDemographics | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_demographics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user demographics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserDemographics:', error);
      return null;
    }
  },

  async updateUserDemographics(demographics: Partial<UserDemographics>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('user_demographics')
        .upsert({
          ...demographics,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user demographics:', error);
      }
    } catch (error) {
      console.error('Error in updateUserDemographics:', error);
    }
  },

  // Get analytics data for admin/insights
  async getInteractionLogs(limit: number = 100): Promise<InteractionLog[]> {
    try {
      const { data, error } = await supabase
        .from('interaction_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching interaction logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInteractionLogs:', error);
      return [];
    }
  },

  async getEngagementMetrics(electionId?: string): Promise<EngagementMetrics[]> {
    try {
      let query = supabase
        .from('engagement_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (electionId) {
        query = query.eq('election_id', electionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching engagement metrics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEngagementMetrics:', error);
      return [];
    }
  }
};
