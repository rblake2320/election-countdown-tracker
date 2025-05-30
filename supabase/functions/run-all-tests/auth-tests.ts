
import { TestResults } from './types.ts';

export async function testAuthentication(supabase: any, testResults: TestResults) {
  console.log("🔐 Testing Authentication...");

  const testUser = {
    email: `test${Date.now()}@test.com`,
    password: 'TestPass123!'
  };

  try {
    // Test signup
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signupError) throw new Error(`Signup failed: ${signupError.message}`);
    if (!signupData.user) throw new Error('No user data returned from signup');

    // Test signin
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signinError) throw new Error(`Signin failed: ${signinError.message}`);
    if (!signinData.session) throw new Error('No session returned from signin');

    // Test session validation
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw new Error(`Session validation failed: ${userError.message}`);

    testResults.passed.push('Authentication: Signup, signin, and session validation working');
  } catch (error) {
    testResults.failed.push(`Authentication: ${error.message}`);
  }
}
