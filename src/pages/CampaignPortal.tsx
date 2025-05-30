
import React from 'react';
import { CampaignDashboard } from '@/components/CampaignDashboard';
import { useParams } from 'react-router-dom';

export const CampaignPortal: React.FC = () => {
  const { campaignId, electionId } = useParams<{ campaignId: string; electionId: string }>();

  if (!campaignId || !electionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Campaign Access</h1>
          <p className="text-gray-600">Campaign ID and Election ID are required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CampaignDashboard campaignId={campaignId} electionId={electionId} />
      </div>
    </div>
  );
};
