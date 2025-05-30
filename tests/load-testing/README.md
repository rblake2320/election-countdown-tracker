
# Load Testing for Election Countdown Platform

This directory contains comprehensive load testing scripts designed to validate the platform's performance under election night conditions.

## 🎯 Testing Objectives

### Primary Goals
- **Election Night Readiness**: Handle 10,000+ concurrent users checking results
- **API Scalability**: Process 1M+ API requests per hour
- **Campaign Analytics**: Support 1,000+ campaigns with real-time dashboards
- **Data Integrity**: Maintain performance during high-traffic archival operations

### Performance Targets
- **Response Time**: 95th percentile < 2 seconds
- **Error Rate**: < 5% under peak load
- **Throughput**: > 500 requests per second
- **Uptime**: 99.9% availability during election events

## 🧪 Test Scenarios

### 1. Election Night Peak (`election_night`)
Simulates the highest traffic scenario when users are actively checking election results.

**Load Profile:**
- **Users**: 0 → 10,000 (20min ramp) → sustain (20min) → ramp down (15min)
- **Duration**: 65 minutes total
- **User Behavior**: Homepage → Election data → State filtering → Candidate info → Voting intent

### 2. API Stress Test (`api_stress`) 
Tests sustained API load equivalent to 1M requests/hour.

**Load Profile:**
- **Rate**: 278 requests/second sustained
- **Duration**: 60 minutes
- **Focus**: Core API endpoints, edge functions, database queries

### 3. Campaign Dashboard (`campaign_dashboard`)
Tests analytics dashboard performance for campaign managers.

**Load Profile:**
- **Users**: 100 → 1,000 campaign managers
- **Duration**: 45 minutes  
- **Focus**: Analytics queries, engagement metrics, interaction logs

## 🚀 Quick Start

### Prerequisites
```bash
# Install K6
brew install k6  # macOS
# or
sudo apt install k6  # Ubuntu
# or download from https://k6.io/docs/getting-started/installation/
```

### Running Tests

```bash
# Make script executable
chmod +x run-load-tests.sh

# Run election night scenario
./run-load-tests.sh election_night staging

# Run API stress test
./run-load-tests.sh api_stress staging

# Run campaign dashboard test
./run-load-tests.sh campaign_dashboard staging

# Quick smoke test
./run-load-tests.sh smoke staging
```

### Environment Variables
```bash
export BASE_URL="https://your-app-url.com"
export SUPABASE_URL="https://your-project.supabase.co" 
export SUPABASE_ANON_KEY="your-anon-key"
```

## 📊 Monitoring During Tests

### Real-time Monitoring
1. **Supabase Dashboard**: Monitor database performance, connections, query times
2. **K6 Output**: Watch real-time metrics in terminal
3. **Application Logs**: Check for errors, slow queries, memory issues

### Key Metrics to Watch
- **Response Times**: p95, p99 response times
- **Error Rates**: HTTP errors, database errors
- **Database**: Connection count, query performance
- **Memory**: Application and database memory usage
- **Cache**: Hit rates for Redis/application cache

### Alert Thresholds
- Response time p95 > 3 seconds → Investigate
- Error rate > 10% → Stop test and investigate  
- Database connections > 180 → Scale concern
- Memory usage > 90% → Resource constraint

## 📈 Results Analysis

### Automated Reports
Test results are saved to `test-results/TIMESTAMP-SCENARIO/`:
- `results.json`: Detailed K6 metrics
- `results.csv`: Time-series data for graphing
- `summary.txt`: Key performance summary

### Manual Analysis
1. **Response Time Distribution**: Check for outliers, degradation patterns
2. **Error Analysis**: Categorize errors (client, server, database)
3. **Throughput**: Verify sustained request handling capability
4. **Resource Utilization**: CPU, memory, database connections

### Performance Comparison
Compare results against:
- Previous test runs (regression testing)
- Performance targets defined above
- Production baseline metrics
- Infrastructure capacity limits

## 🔧 Troubleshooting Common Issues

### High Error Rates
- Check database connection limits
- Verify RLS policies allow test operations
- Ensure edge functions aren't rate-limited
- Check for memory leaks

### Slow Response Times
- Identify slow database queries
- Check for cache misses
- Monitor connection pool exhaustion
- Review query optimization

### Test Failures
- Verify application accessibility before testing
- Check environment variable configuration
- Ensure sufficient test machine resources
- Validate Supabase project limits

## 🎯 Election Night Readiness Checklist

### Pre-Election Testing
- [ ] Run full election night scenario successfully
- [ ] Validate all performance targets met
- [ ] Test database failover procedures
- [ ] Verify monitoring and alerting systems
- [ ] Load test campaign dashboard concurrent access

### Infrastructure Verification
- [ ] Database connection limits increased for peak load
- [ ] Edge function concurrency limits verified
- [ ] CDN cache rules optimized for election data
- [ ] Backup systems tested and ready
- [ ] Monitoring dashboards configured and accessible

### Post-Test Actions
- [ ] Document any performance issues found
- [ ] Implement optimizations for identified bottlenecks
- [ ] Update capacity planning based on results
- [ ] Schedule follow-up tests after optimizations
- [ ] Brief team on election night procedures

## 🔗 Related Documentation
- [Monitoring Setup Guide](../monitoring/README.md)
- [Database Optimization](../database/optimization.md)
- [Backup Strategy](../backup/strategy.md)
- [Election Night Runbook](../operations/election-night.md)
