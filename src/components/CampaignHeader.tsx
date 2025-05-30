
import React from 'react';
import { Badge } from './ui/badge';
import { SUBSCRIPTION_TIERS } from '@/types/campaign';
import type { CampaignAccount } from '@/types/campaign';

interface CampaignHeaderProps {
  campaign: CampaignAccount;
}

export const CampaignHeader: React.FC<CampaignHeaderProps> = ({ campaign }) => {
  const currentTier = SUBSCRIPTION_TIERS[campaign.subscription_tier];

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{campaign.candidate_name}</h1>
        <p className="text-gray-600">{campaign.office_seeking}</p>
      </div>
      <div className="flex items-center space-x-3">
        <Badge variant={campaign.verified_status ? "default" : "secondary"}>
          {campaign.verified_status ? "Verified" : "Unverified"}
        </Badge>
        <Badge variant="outline">{currentTier.name} Plan</Badge>
      </div>
    </div>
  );
};
