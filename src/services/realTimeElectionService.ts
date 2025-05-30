
import { supabase } from '@/integrations/supabase/client';
import { Election } from '@/types/election';

export interface RealTimeElectionUpdate {
  elections: Election[];
  lastUpdated: string;
  source: string;
}

class RealTimeElectionService {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((data: RealTimeElectionUpdate) => void)[] = [];

  async startRealTimeUpdates(intervalMs: number = 30000) { // 30 seconds
    console.log('Starting real-time election updates...');
    
    // Initial fetch
    await this.fetchAndBroadcastUpdates();
    
    // Set up periodic updates
    this.updateInterval = setInterval(async () => {
      await this.fetchAndBroadcastUpdates();
    }, intervalMs);

    // Set up Supabase real-time subscription
    this.setupSupabaseRealtime();
  }

  private setupSupabaseRealtime() {
    const channel = supabase
      .channel('election-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'elections'
        },
        () => {
          console.log('Election data changed, fetching updates...');
          this.fetchAndBroadcastUpdates();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates'
        },
        () => {
          console.log('Candidate data changed, fetching updates...');
          this.fetchAndBroadcastUpdates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  private async fetchAndBroadcastUpdates() {
    try {
      console.log('Fetching real-time election updates...');
      
      // Fetch elections with a more comprehensive query
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .gte('election_dt', new Date().toISOString()) // Only future elections
        .order('election_dt', { ascending: true })
        .limit(50); // Increased limit

      if (electionsError) {
        console.error('Error fetching elections:', electionsError);
        return;
      }

      // Fetch all candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .order('poll_pct', { ascending: false });

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError);
        return;
      }

      console.log(`Real-time update: ${electionsData?.length || 0} elections, ${candidatesData?.length || 0} candidates`);

      // Group candidates by election
      const candidatesByElection = (candidatesData || []).reduce((acc, candidate) => {
        if (!acc[candidate.election_id]) {
          acc[candidate.election_id] = [];
        }
        acc[candidate.election_id].push(candidate);
        return acc;
      }, {} as Record<string, typeof candidatesData[0][]>);

      // Transform to Election format
      const elections: Election[] = (electionsData || []).map(election => ({
        id: election.id,
        title: election.office_name,
        date: election.election_dt,
        type: election.is_special ? 'Special' : election.office_level,
        state: election.state,
        description: election.description || `${election.office_level} election in ${election.state}`,
        candidates: candidatesByElection[election.id]?.map(candidate => ({
          name: candidate.name,
          party: candidate.party,
          pollingPercentage: Math.round(candidate.poll_pct || 0),
          trend: this.calculateTrend(candidate.poll_pct || 0),
          endorsements: Math.floor(Math.random() * 20) // TODO: Get real endorsement data
        })) || [],
        keyRaces: [election.office_name]
      }));

      const updateData: RealTimeElectionUpdate = {
        elections,
        lastUpdated: new Date().toISOString(),
        source: 'database'
      };

      this.broadcastToSubscribers(updateData);
    } catch (error) {
      console.error('Error in fetchAndBroadcastUpdates:', error);
    }
  }

  private calculateTrend(pollPct: number): 'up' | 'down' | 'stable' {
    // Simple trend calculation - in real app, compare with previous poll
    const random = Math.random();
    if (pollPct > 40) return random > 0.7 ? 'up' : 'stable';
    if (pollPct < 20) return random > 0.7 ? 'down' : 'stable';
    return random > 0.6 ? 'up' : random > 0.3 ? 'stable' : 'down';
  }

  private broadcastToSubscribers(data: RealTimeElectionUpdate) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  subscribe(callback: (data: RealTimeElectionUpdate) => void) {
    this.subscribers.push(callback);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers = [];
    console.log('Stopped real-time election updates');
  }

  async forceRefresh() {
    console.log('Force refreshing election data...');
    await this.fetchAndBroadcastUpdates();
  }
}

export const realTimeElectionService = new RealTimeElectionService();
