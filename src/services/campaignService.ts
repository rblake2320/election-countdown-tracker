
import { supabase } from '@/integrations/supabase/client';
import type { CampaignAccount, CampaignAnalytics, CampaignAccessLog, DataPurchase } from '@/types/campaign';

export const campaignService = {
  // Campaign account management
  async getCampaignAccount(campaignId: string): Promise<CampaignAccount | null> {
    try {
      const { data, error } = await supabase
        .from('campaign_accounts')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching campaign account:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCampaignAccount:', error);
      return null;
    }
  },

  async createCampaignAccount(account: Omit<CampaignAccount, 'id' | 'created_at' | 'updated_at'>): Promise<CampaignAccount | null> {
    try {
      const { data, error } = await supabase
        .from('campaign_accounts')
        .insert(account)
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign account:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createCampaignAccount:', error);
      return null;
    }
  },

  // Analytics access
  async getCampaignAnalytics(campaignId: string, electionId: string): Promise<CampaignAnalytics | null> {
    try {
      // First verify campaign has access
      const campaign = await this.getCampaignAccount(campaignId);
      if (!campaign) return null;

      // Log the access
      await this.logDataAccess(campaignId, `analytics_${electionId}`, this.getAnalyticsCost(campaign.subscription_tier));

      // Fetch aggregated analytics data
      const { data: engagementData, error: engagementError } = await supabase
        .from('engagement_metrics')
        .select('*')
        .eq('election_id', electionId);

      if (engagementError) {
        console.error('Error fetching engagement data:', engagementError);
        return null;
      }

      // Aggregate the data for privacy compliance
      const analytics: CampaignAnalytics = {
        election_id: electionId,
        view_count: engagementData?.length || 0,
        unique_viewers: new Set(engagementData?.map(d => d.user_id).filter(Boolean)).size,
        avg_time_spent: engagementData?.reduce((acc, d) => acc + (d.time_spent || 0), 0) / (engagementData?.length || 1),
        demographic_breakdown: await this.getAnonymizedDemographics(electionId),
        engagement_score: this.calculateEngagementScore(engagementData || []),
        trending_metrics: {
          daily_growth: 0, // TODO: Implement trending calculations
          weekly_growth: 0,
          competitor_comparison: {}
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error in getCampaignAnalytics:', error);
      return null;
    }
  },

  // Data access logging
  async logDataAccess(campaignId: string, dataType: string, cost: number): Promise<void> {
    try {
      const accessLog: Omit<CampaignAccessLog, 'id'> = {
        campaign_id: campaignId,
        data_accessed: dataType,
        timestamp: new Date().toISOString(),
        cost
      };

      const { error } = await supabase
        .from('campaign_access_logs')
        .insert(accessLog);

      if (error) {
        console.error('Error logging data access:', error);
      }
    } catch (error) {
      console.error('Error in logDataAccess:', error);
    }
  },

  // Purchase tracking
  async recordDataPurchase(purchase: Omit<DataPurchase, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_purchases')
        .insert(purchase);

      if (error) {
        console.error('Error recording data purchase:', error);
      }
    } catch (error) {
      console.error('Error in recordDataPurchase:', error);
    }
  },

  // Helper methods
  private getAnalyticsCost(tier: string): number {
    const costs = {
      basic: 0,
      pro: 5,
      enterprise: 15,
      custom: 0
    };
    return costs[tier as keyof typeof costs] || 0;
  },

  private async getAnonymizedDemographics(electionId: string): Promise<Record<string, number>> {
    try {
      // Get user IDs who engaged with this election
      const { data: engagementData } = await supabase
        .from('engagement_metrics')
        .select('user_id')
        .eq('election_id', electionId)
        .not('user_id', 'is', null);

      if (!engagementData?.length) return {};

      const userIds = engagementData.map(d => d.user_id);

      // Get demographics for these users (aggregated)
      const { data: demographics } = await supabase
        .from('user_demographics')
        .select('age_range, state')
        .in('user_id', userIds);

      // Aggregate by age range (anonymized)
      const breakdown: Record<string, number> = {};
      demographics?.forEach(demo => {
        if (demo.age_range) {
          breakdown[demo.age_range] = (breakdown[demo.age_range] || 0) + 1;
        }
      });

      return breakdown;
    } catch (error) {
      console.error('Error getting anonymized demographics:', error);
      return {};
    }
  },

  private calculateEngagementScore(metrics: any[]): number {
    if (!metrics.length) return 0;
    
    const avgTimeSpent = metrics.reduce((acc, m) => acc + (m.time_spent || 0), 0) / metrics.length;
    const avgInteractions = metrics.reduce((acc, m) => acc + (m.interactions_count || 0), 0) / metrics.length;
    const avgScrollDepth = metrics.reduce((acc, m) => acc + (m.scroll_depth || 0), 0) / metrics.length;
    
    // Weighted engagement score
    return Math.round((avgTimeSpent * 0.4 + avgInteractions * 0.3 + avgScrollDepth * 0.3) * 10) / 10;
  }
};
