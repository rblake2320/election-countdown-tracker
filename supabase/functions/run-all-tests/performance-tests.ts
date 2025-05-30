
import { TestResults } from './types.ts';

export async function testPerformance(supabase: any, testResults: TestResults) {
  console.log("⚡ Testing Performance...");

  try {
    // Test response times
    const start = Date.now();
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(supabase.from('elections').select('*').limit(10));
      promises.push(supabase.from('candidates').select('*').limit(10));
    }

    await Promise.all(promises);
    const duration = Date.now() - start;
    const avgTime = duration / 10;

    if (avgTime > 1000) {
      testResults.warnings.push(`Performance: Slow database response time ${avgTime}ms`);
    } else {
      testResults.passed.push(`Performance: Good database response time ${avgTime.toFixed(0)}ms avg`);
    }

  } catch (error) {
    testResults.failed.push(`Performance: ${error.message}`);
  }
}
