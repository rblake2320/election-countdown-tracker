
import { supabase } from '@/integrations/supabase/client';
import { SystemStatus } from '@/types/diagnostics';

export const useSecurityTests = () => {
  const testSecurity = async (diagnostics: SystemStatus) => {
    console.log('🔒 Testing security and RLS policies...');

    try {
      // Test RLS policies on critical tables - using type assertion for diagnostic purposes
      const tables = ['elections', 'candidates', 'interaction_logs', 'user_analytics'];

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select('*')
            .limit(1);

          if (error) {
            // Check if it's an RLS policy violation
            if (error.code === '42501') {
              diagnostics.security.push({
                category: 'Security',
                test: `RLS Policy - ${table}`,
                status: 'warning',
                message: `RLS policy blocking access to ${table}`,
                details: { table, error: error.message }
              });
            } else {
              diagnostics.security.push({
                category: 'Security',
                test: `Table Access - ${table}`,
                status: 'fail',
                message: `Cannot access ${table}: ${error.message}`,
                details: error
              });
            }
          } else {
            diagnostics.security.push({
              category: 'Security',
              test: `Table Access - ${table}`,
              status: 'pass',
              message: `${table} accessible`,
              details: { recordCount: data?.length }
            });
          }
        } catch (err: any) {
          diagnostics.security.push({
            category: 'Security',
            test: `Table Test - ${table}`,
            status: 'fail',
            message: `Test failed for ${table}: ${err.message}`
          });
        }
      }

    } catch (error: any) {
      diagnostics.security.push({
        category: 'Security',
        test: 'Security System',
        status: 'fail',
        message: `Security test failed: ${error.message}`,
        details: error
      });
    }
  };

  return { testSecurity };
};
