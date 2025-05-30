
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { campaignService } from '@/services/campaignService';
import { SUBSCRIPTION_TIERS } from '@/types/campaign';
import type { CampaignAccount, CampaignAnalytics } from '@/types/campaign';
import { BarChart3, Users, TrendingUp, DollarSign, Eye, Clock } from 'lucide-react';

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

  const currentTier = SUBSCRIPTION_TIERS[campaign.subscription_tier];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.view_count.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.unique_viewers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.avg_time_spent)}s</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.engagement_score}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
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
    </div>
  );
};
