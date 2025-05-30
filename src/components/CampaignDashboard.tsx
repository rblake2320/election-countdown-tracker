
import React, { useState, useEffect } from 'react';
import { campaignService } from '@/services/campaignService';
import type { CampaignAccount, CampaignAnalytics } from '@/types/campaign';
import { CampaignHeader } from './CampaignHeader';
import { CampaignMetrics } from './CampaignMetrics';
import { CampaignTabs } from './CampaignTabs';

interface CampaignDashboardProps {
  campaignId: string;
  electionId: string;
}

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ campaignId, electionId }) => {
  const [campaign, setCampaign] = useState<CampaignAccount | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaignData();
  }, [campaignId, electionId]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignData, analyticsData] = await Promise.all([
        campaignService.getCampaignAccount(campaignId),
        campaignService.getCampaignAnalytics(campaignId, electionId)
      ]);
      
      setCampaign(campaignData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign dashboard...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Campaign not found or access denied.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignHeader campaign={campaign} />
      <CampaignMetrics analytics={analytics} />
      <CampaignTabs campaign={campaign} analytics={analytics} />
    </div>
  );
};
