
import { TestResults, TestReport } from './types.ts';

export function generateReport(testResults: TestResults): TestReport {
  const report = {
    summary: {
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      warnings: testResults.warnings.length,
      total: testResults.passed.length + testResults.failed.length + testResults.warnings.length
    },
    details: {
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings
    },
    timestamp: new Date().toISOString()
  };

  const score = testResults.failed.length === 0 ? 
    100 : 
    (testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100;

  let status: 'PERFECT' | 'READY' | 'CRITICAL' | 'ERROR';
  let message: string;

  if (testResults.failed.length > 0) {
    status = 'CRITICAL';
    message = '🚨 CRITICAL: Platform NOT ready for launch! Fix critical issues immediately.';
  } else if (testResults.warnings.length > 0) {
    status = 'READY';
    message = '⚡ READY: Can launch, but address warnings soon';
  } else {
    status = 'PERFECT';
    message = '🚀 PERFECT: Ready for production!';
  }

  const finalReport = {
    ...report,
    status,
    message,
    score
  };
  
  console.log(`\n📋 Test completed with ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.warnings} warnings`);
  console.log(`🎯 Overall Score: ${score.toFixed(1)}% - Status: ${status}`);
  
  return finalReport;
}
