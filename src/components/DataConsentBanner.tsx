
import React, { useState, useEffect } from 'react';
import { Shield, Database, TrendingUp, DollarSign, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { analyticsService } from '@/services/analyticsService';

export const DataConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = async () => {
    try {
      const userPrefs = await analyticsService.getUserPreferences();
      setPreferences(userPrefs);
      
      // Show banner if user hasn't opted into data sharing
      if (!userPrefs?.analytics_consent) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error checking consent status:', error);
    }
  };

  const handleOptIn = async () => {
    try {
      await analyticsService.updateUserPreferences({
        privacy_consent: true,
        analytics_consent: true
      });
      setIsVisible(false);
    } catch (error) {
      console.error('Error opting into data sharing:', error);
    }
  };

  const handleOptOut = async () => {
    try {
      await analyticsService.updateUserPreferences({
        privacy_consent: true,
        analytics_consent: false
      });
      setIsVisible(false);
    } catch (error) {
      console.error('Error opting out of data sharing:', error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="container mx-auto">
        {!showDetails ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Help Improve Democracy</h3>
                <p className="text-sm text-gray-600">
                  Share your anonymized data to help campaigns better understand voter engagement
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowDetails(true)} variant="ghost" size="sm">
                Learn More
              </Button>
              <Button onClick={handleOptOut} variant="outline" size="sm">
                No Thanks
              </Button>
              <Button onClick={handleOptIn} className="bg-blue-600 hover:bg-blue-700" size="sm">
                Share Data
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Data Sharing Benefits</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">100% Anonymous</h4>
                    <p className="text-sm text-gray-600">
                      Your personal information is never shared. Only aggregated, anonymized data is used.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Better Campaigns</h4>
                    <p className="text-sm text-gray-600">
                      Help campaigns understand what issues matter most to voters like you.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Support Our Platform</h4>
                    <p className="text-sm text-gray-600">
                      Revenue from anonymized data helps keep this service free for voters.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">What Data Is Shared?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• General age range (e.g., "25-34")</li>
                  <li>• State/region (no specific addresses)</li>
                  <li>• Which elections you view (not who you support)</li>
                  <li>• How long you engage with content</li>
                  <li>• Your device type and browser (for technical improvements)</li>
                </ul>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-xs text-gray-500">
                  You can change this preference anytime in your account settings
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleOptOut} variant="outline">
                    Don't Share Data
                  </Button>
                  <Button onClick={handleOptIn} className="bg-blue-600 hover:bg-blue-700">
                    Share Anonymous Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
