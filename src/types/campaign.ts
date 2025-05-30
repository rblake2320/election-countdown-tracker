
export interface CampaignAccount {
  id: string;
  candidate_name: string;
  office_seeking: string;
  verified_status: boolean;
  subscription_tier: 'basic' | 'pro' | 'enterprise' | 'custom';
  created_at: string;
  updated_at: string;
}

export interface CampaignAccessLog {
  id: string;
  campaign_id: string;
  data_accessed: string;
  timestamp: string;
  cost: number;
}

export interface DataPurchase {
  id: string;
  campaign_id: string;
  dataset_type: string;
  price: number;
  download_date: string;
}

export interface PollingResult {
  id: string;
  location: string;
  demographic: string;
  candidate_preferences: Record<string, number>;
  sample_size: number;
  margin_error: number;
  created_at: string;
}

export interface UserSegment {
  id: string;
  segment_id: string;
  criteria: Record<string, any>;
  user_count: number;
  created_at: string;
}

export interface GeographicCluster {
  id: string;
  zip_code: string;
  interest_level: number;
  party_lean: string;
  user_count: number;
}

export interface CampaignAnalytics {
  election_id: string;
  view_count: number;
  unique_viewers: number;
  avg_time_spent: number;
  demographic_breakdown: Record<string, number>;
  engagement_score: number;
  trending_metrics: {
    daily_growth: number;
    weekly_growth: number;
    competitor_comparison: Record<string, number>;
  };
}

export type SubscriptionTier = {
  name: string;
  price: number;
  features: string[];
  limits: {
    state_data: boolean;
    district_data: boolean;
    individual_insights: boolean;
    raw_exports: boolean;
    api_calls_per_month: number;
  };
};

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  basic: {
    name: 'Basic',
    price: 99,
    features: ['Aggregated state data', 'Basic demographics', 'Monthly reports'],
    limits: {
      state_data: true,
      district_data: false,
      individual_insights: false,
      raw_exports: false,
      api_calls_per_month: 1000
    }
  },
  pro: {
    name: 'Pro',
    price: 499,
    features: ['District-level analytics', 'Real-time updates', 'Competitor comparisons'],
    limits: {
      state_data: true,
      district_data: true,
      individual_insights: false,
      raw_exports: false,
      api_calls_per_month: 10000
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 2499,
    features: ['Individual user insights (anonymized)', 'Predictive modeling', 'Custom dashboards'],
    limits: {
      state_data: true,
      district_data: true,
      individual_insights: true,
      raw_exports: false,
      api_calls_per_month: 100000
    }
  },
  custom: {
    name: 'Custom',
    price: 0, // Contact for pricing
    features: ['Raw data exports', 'Custom integrations', 'Dedicated support'],
    limits: {
      state_data: true,
      district_data: true,
      individual_insights: true,
      raw_exports: true,
      api_calls_per_month: -1 // Unlimited
    }
  }
};
