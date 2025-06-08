
import { supabase } from '@/integrations/supabase/client';
import { DiagnosticResult, SystemStatus } from '@/types/diagnostics';

export const useDatabaseTests = () => {
  const testDatabase = async (diagnostics: SystemStatus) => {
    console.log('📊 Testing database connectivity and data...');

    try {
      // Test basic connectivity
      const { data: connectTest, error: connectError } = await supabase
        .from('elections')
        .select('count', { count: 'exact', head: true });

      if (connectError) {
        diagnostics.database.push({
          category: 'Database',
          test: 'Basic Connectivity',
          status: 'fail',
          message: `Cannot connect to database: ${connectError.message}`,
          details: connectError
        });
        return;
      }

      diagnostics.database.push({
        category: 'Database',
        test: 'Basic Connectivity',
        status: 'pass',
        message: 'Successfully connected to database'
      });

      // Test elections table
      const { data: elections, error: electionsError } = await supabase
        .from('elections')
        .select('*');

      if (electionsError) {
        diagnostics.database.push({
          category: 'Database',
          test: 'Elections Table Access',
          status: 'fail',
          message: `Cannot access elections table: ${electionsError.message}`,
          details: electionsError
        });
      } else {
        const count = elections?.length || 0;
        diagnostics.database.push({
          category: 'Database',
          test: 'Elections Data Count',
          status: count >= 160 ? 'pass' : count >= 50 ? 'warning' : 'fail',
          message: `Found ${count} elections (Required: 160+)`,
          details: { count, elections: elections?.slice(0, 5) }
        });

        // Test election distribution
        const federalCount = elections?.filter(e => e.office_level === 'Federal').length || 0;
        const stateCount = elections?.filter(e => e.office_level === 'State').length || 0;
        const localCount = elections?.filter(e => e.office_level === 'Local').length || 0;

        diagnostics.database.push({
          category: 'Database',
          test: 'Election Level Distribution',
          status: federalCount > 0 && stateCount > 0 && localCount > 0 ? 'pass' : 'warning',
          message: `Federal: ${federalCount}, State: ${stateCount}, Local: ${localCount}`,
          details: { federalCount, stateCount, localCount }
        });

        // Test state coverage
        const states = [...new Set(elections?.map(e => e.state) || [])];
        diagnostics.database.push({
          category: 'Database',
          test: 'State Coverage',
          status: states.length >= 50 ? 'pass' : 'warning',
          message: `Covering ${states.length} states/territories`,
          details: { states: states.slice(0, 10) }
        });
      }

      // Test candidates table
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*');

      if (candidatesError) {
        diagnostics.database.push({
          category: 'Database',
          test: 'Candidates Table',
          status: 'fail',
          message: `Cannot access candidates: ${candidatesError.message}`
        });
      } else {
        diagnostics.database.push({
          category: 'Database',
          test: 'Candidates Data',
          status: 'pass',
          message: `Found ${candidates?.length || 0} candidates`
        });
      }

      // Test election cycles
      const { data: cycles, error: cyclesError } = await supabase
        .from('election_cycles')
        .select('*');

      diagnostics.database.push({
        category: 'Database',
        test: 'Election Cycles',
        status: cyclesError ? 'fail' : 'pass',
        message: cyclesError ? cyclesError.message : `Found ${cycles?.length || 0} election cycles`
      });

    } catch (error: any) {
      diagnostics.database.push({
        category: 'Database',
        test: 'Overall Database Test',
        status: 'fail',
        message: `Database test failed: ${error.message}`,
        details: error
      });
    }
  };

  return { testDatabase };
};
