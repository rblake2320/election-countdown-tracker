
import { supabase } from '@/integrations/supabase/client';
import { SystemStatus } from '@/types/diagnostics';

export const useAuthenticationTests = () => {
  const testAuthentication = async (diagnostics: SystemStatus) => {
    console.log('🔐 Testing authentication...');

    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      diagnostics.authentication.push({
        category: 'Authentication',
        test: 'Session Check',
        status: sessionError ? 'fail' : session ? 'pass' : 'warning',
        message: sessionError ? sessionError.message : session ? 'User authenticated' : 'No active session',
        details: { hasSession: !!session, user: session?.user?.email }
      });

      // Test user profile access
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        diagnostics.authentication.push({
          category: 'Authentication',
          test: 'User Profile Access',
          status: profileError ? 'warning' : 'pass',
          message: profileError ? 'No profile found' : 'Profile accessible',
          details: { profile }
        });
      }

    } catch (error: any) {
      diagnostics.authentication.push({
        category: 'Authentication',
        test: 'Authentication System',
        status: 'fail',
        message: `Auth test failed: ${error.message}`,
        details: error
      });
    }
  };

  return { testAuthentication };
};
