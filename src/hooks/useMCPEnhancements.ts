
import { useState, useEffect, useCallback } from 'react';
import { mcpEnhancementService } from '@/services/mcpEnhancementService';

interface MCPHookState {
  isInitialized: boolean;
  globalElections: any[];
  eventStream: any[];
  verificationResults: any[];
  complianceStatus: any[];
  scrapingResults: any[];
  error: string | null;
  isLoading: boolean;
}

export const useMCPEnhancements = () => {
  const [state, setState] = useState<MCPHookState>({
    isInitialized: false,
    globalElections: [],
    eventStream: [],
    verificationResults: [],
    complianceStatus: [],
    scrapingResults: [],
    error: null,
    isLoading: false
  });

  const initializeServices = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🚀 Initializing MCP services through hook...');
      
      // Initialize event streaming
      await mcpEnhancementService.initializeEventStreaming();
      
      // Fetch global election data
      const globalData = await mcpEnhancementService.fetchGlobalElectionData();
      
      // Check compliance
      const compliance = await mcpEnhancementService.checkCompliance('election_data');
      
      // Start enhanced scraping
      const scrapingResults = await mcpEnhancementService.enhancedScraping();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        globalElections: globalData,
        complianceStatus: compliance,
        scrapingResults,
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error initializing MCP services:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
    }
  }, []);

  const fetchVoterProfile = useCallback(async (zipCode: string) => {
    try {
      const profile = await mcpEnhancementService.getVoterProfile(zipCode);
      return profile;
    } catch (error) {
      console.error('Error fetching voter profile:', error);
      return null;
    }
  }, []);

  const fetchCampaignFinance = useCallback(async (candidateId: string) => {
    try {
      const financeData = await mcpEnhancementService.fetchCampaignFinanceData(candidateId);
      return financeData;
    } catch (error) {
      console.error('Error fetching campaign finance:', error);
      return null;
    }
  }, []);

  const storeOnBlockchain = useCallback(async (electionId: string, results: any) => {
    try {
      const hash = await mcpEnhancementService.storeResultsOnBlockchain(electionId, results);
      return hash;
    } catch (error) {
      console.error('Error storing on blockchain:', error);
      return null;
    }
  }, []);

  const refreshGlobalData = useCallback(async (countryCode?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const globalData = await mcpEnhancementService.fetchGlobalElectionData(countryCode);
      setState(prev => ({
        ...prev,
        globalElections: globalData,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error refreshing global data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false
      }));
    }
  }, []);

  const triggerEnhancedScraping = useCallback(async (targets?: string[]) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const results = await mcpEnhancementService.enhancedScraping(targets);
      setState(prev => ({
        ...prev,
        scrapingResults: results,
        isLoading: false
      }));
      return results;
    } catch (error) {
      console.error('Error in enhanced scraping:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Scraping failed',
        isLoading: false
      }));
      return [];
    }
  }, []);

  useEffect(() => {
    // Auto-initialize on mount
    initializeServices();
  }, [initializeServices]);

  return {
    ...state,
    initializeServices,
    fetchVoterProfile,
    fetchCampaignFinance,
    storeOnBlockchain,
    refreshGlobalData,
    triggerEnhancedScraping
  };
};
