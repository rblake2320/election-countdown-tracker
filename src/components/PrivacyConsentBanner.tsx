
import React, { useState, useEffect } from 'react';
import { X, Shield, Eye, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { analyticsService } from '@/services/analyticsService';

export const PrivacyConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    const checkConsentStatus = async () => {
      try {
        const userPrefs = await analyticsService.getUserPreferences();
        setPreferences(userPrefs);
        
        // Show banner if user hasn't given consent yet
        if (!userPrefs || userPrefs.privacy_consent === null || userPrefs.privacy_consent === undefined) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking consent status:', error);
      }
    };

    checkConsentStatus();
  }, []);

  const handleAcceptAll = async () => {
    try {
      await analyticsService.updateUserPreferences({
        privacy_consent: true,
        analytics_consent: true
      });
      setIsVisible(false);
    } catch (error) {
      console.error('Error updating consent preferences:', error);
    }
  };

  const handleAcceptEssential = async () => {
    try {
      await analyticsService.updateUserPreferences({
        privacy_consent: true,
        analytics_consent: false
      });
      setIsVisible(false);
    } catch (error) {
      console.error('Error updating consent preferences:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Your Privacy Matters</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              We use cookies and collect data to improve your election tracking experience. 
              This helps us provide better insights and personalized content.
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Essential functionality</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                <span>Analytics & improvements</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleAcceptAll}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept All
          </Button>
          <Button
            onClick={handleAcceptEssential}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Essential Only
          </Button>
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              // Could open a detailed privacy settings modal
              handleAcceptEssential();
            }}
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};
