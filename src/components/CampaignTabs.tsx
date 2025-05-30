
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SUBSCRIPTION_TIERS } from '@/types/campaign';
import type { CampaignAccount, CampaignAnalytics } from '@/types/campaign';

interface CampaignTabsProps {
  campaign: CampaignAccount;
  analytics: CampaignAnalytics | null;
}

export const CampaignTabs: React.FC<CampaignTabsProps> = ({ campaign, analytics }) => {
  const currentTier = SUBSCRIPTION_TIERS[campaign.subscription_tier];

  return (
    <Tabs defaultValue="demographics" className="space-y-4">
      <TabsList>
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
      </TabsList>

      <TabsContent value="demographics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Viewer Demographics</CardTitle>
            <CardDescription>
              Anonymized demographic breakdown of your viewers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.demographic_breakdown ? (
              <div className="space-y-3">
                {Object.entries(analytics.demographic_breakdown).map(([ageRange, count]) => (
                  <div key={ageRange} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{ageRange}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(count / Math.max(...Object.values(analytics.demographic_breakdown))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No demographic data available yet.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>
              Your campaign's performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Daily Growth</span>
                <span className="font-semibold">
                  {analytics?.trending_metrics.daily_growth || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Weekly Growth</span>
                <span className="font-semibold">
                  {analytics?.trending_metrics.weekly_growth || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan: {currentTier.name}</CardTitle>
            <CardDescription>
              {currentTier.price > 0 ? `$${currentTier.price}/month` : 'Contact for pricing'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-1">
                  {currentTier.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">API Usage:</h4>
                <p className="text-sm text-gray-600">
                  {currentTier.limits.api_calls_per_month === -1 
                    ? 'Unlimited API calls' 
                    : `${currentTier.limits.api_calls_per_month.toLocaleString()} calls per month`
                  }
                </p>
              </div>

              <Button variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
