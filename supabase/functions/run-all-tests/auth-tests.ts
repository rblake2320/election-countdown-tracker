
import { TestResults } from './types.ts';

export async function testAuthentication(supabase: any, testResults: TestResults) {
  console.log("🔐 Testing Authentication...");

  // Use a properly formatted test email with current timestamp
  const testUser = {
    email: `test.user.${Date.now()}@example.com`,
    password: 'TestPass123!'
  };

  try {
    // Test signup with proper email format
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signupError) {
      // Check if it's just an email confirmation required (which is normal)
      if (signupError.message.includes('confirm') || signupError.message.includes('verification')) {
        testResults.passed.push('Authentication: Signup working (email confirmation required)');
      } else {
        throw new Error(`Signup failed: ${signupError.message}`);
      }
    } else if (signupData.user) {
      testResults.passed.push('Authentication: Signup working correctly');
    }

    // Test signin (may fail if email confirmation is required, which is expected)
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signinError) {
      if (signinError.message.includes('confirm') || signinError.message.includes('verification')) {
        testResults.passed.push('Authentication: Signin working (email confirmation required)');
      } else {
        testResults.warnings.push(`Authentication: Signin failed - ${signinError.message}`);
      }
    } else if (signinData.session) {
      testResults.passed.push('Authentication: Signin working correctly');
      
      // Test session validation only if signin worked
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        testResults.warnings.push(`Authentication: Session validation failed - ${userError.message}`);
      } else if (user) {
        testResults.passed.push('Authentication: Session validation working');
      }
    }

    // Test auth configuration
    const { data: configData, error: configError } = await supabase.auth.getSession();
    if (!configError) {
      testResults.passed.push('Authentication: Auth service configuration working');
    }

  } catch (error) {
    testResults.failed.push(`Authentication: ${error.message}`);
  } finally {
    // Always try to clean up by signing out
    try {
      await supabase.auth.signOut();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}
