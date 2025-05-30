
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const apiCalls = new Counter('api_calls');

// Load testing configuration for election night
export let options = {
  scenarios: {
    // Election night peak traffic - 10k concurrent users
    election_night_peak: {
      executor: 'ramping-vus',
      startVUs: 100,
      stages: [
        { duration: '5m', target: 1000 },   // Ramp up to 1k users
        { duration: '10m', target: 5000 },  // Scale to 5k users
        { duration: '15m', target: 10000 }, // Peak at 10k users
        { duration: '20m', target: 10000 }, // Sustain peak load
        { duration: '10m', target: 5000 },  // Scale down
        { duration: '5m', target: 0 },      // Ramp down
      ],
    },
    // Background API requests - 1M requests/hour sustained
    api_sustained_load: {
      executor: 'constant-arrival-rate',
      rate: 278, // ~1M requests/hour (1000000/3600)
      timeUnit: '1s',
      duration: '65m',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
    // Campaign dashboard users
    campaign_dashboard_users: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '30m', target: 500 },
        { duration: '30m', target: 1000 },
        { duration: '3m', target: 0 },
      ],
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],    // Error rate under 5%
    errors: ['rate<0.05'],
    response_time: ['p(90)<1500'],
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'https://afce7e55-0b81-463a-ace0-821ebed0b1c5.lovableproject.com';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://viwrhnkkojgkclwnsxdb.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY;

// Test data
const testStates = ['CA', 'TX', 'FL', 'NY', 'PA'];
const testParties = ['DEM', 'REP', 'IND'];
const testOffices = ['U.S. Senate', 'U.S. House', 'Governor', 'State Senate'];

export function setup() {
  console.log('Starting load test setup...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Target: 10,000 concurrent users`);
  console.log(`API Rate: 1M requests/hour`);
  return {};
}

export default function () {
  const scenario = __ENV.K6_SCENARIO || 'election_night_peak';
  
  // Simulate different user behaviors based on scenario
  switch (scenario) {
    case 'election_night_peak':
      electionNightUserBehavior();
      break;
    case 'api_sustained_load':
      apiSustainedLoad();
      break;
    case 'campaign_dashboard_users':
      campaignDashboardBehavior();
      break;
    default:
      electionNightUserBehavior();
  }
}

function electionNightUserBehavior() {
  const startTime = Date.now();
  
  // 1. Load main page
  let response = http.get(BASE_URL);
  check(response, {
    'homepage loads': (r) => r.status === 200,
    'homepage response time OK': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
  
  apiCalls.add(1);
  responseTime.add(response.timings.duration);
  
  sleep(Math.random() * 2 + 1); // 1-3 seconds thinking time
  
  // 2. Fetch real-time elections data
  const headers = SUPABASE_ANON_KEY ? {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  } : {};
  
  response = http.get(`${SUPABASE_URL}/rest/v1/elections?select=*&order=election_dt.asc`, {
    headers: headers
  });
  
  check(response, {
    'elections API works': (r) => r.status === 200,
    'elections API fast': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);
  
  apiCalls.add(1);
  responseTime.add(response.timings.duration);
  
  sleep(Math.random() * 1 + 0.5);
  
  // 3. Filter by state (common user action)
  const randomState = testStates[Math.floor(Math.random() * testStates.length)];
  response = http.get(`${SUPABASE_URL}/rest/v1/elections?select=*&state=eq.${randomState}`, {
    headers: headers
  });
  
  check(response, {
    'state filter works': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  apiCalls.add(1);
  responseTime.add(response.timings.duration);
  
  sleep(Math.random() * 2 + 1);
  
  // 4. Get candidates for an election
  response = http.get(`${SUPABASE_URL}/rest/v1/candidates?select=*&limit=20`, {
    headers: headers
  });
  
  check(response, {
    'candidates API works': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  apiCalls.add(1);
  responseTime.add(response.timings.duration);
  
  // 5. Simulate voting intent (if user is engaged)
  if (Math.random() < 0.3) { // 30% of users submit voting intent
    const intentPayload = {
      candidate_id: `candidate-${Math.floor(Math.random() * 100)}`,
      weight: 1
    };
    
    response = http.post(`${SUPABASE_URL}/rest/v1/votes_intent`, JSON.stringify(intentPayload), {
      headers: headers
    });
    
    check(response, {
      'voting intent submitted': (r) => r.status === 201 || r.status === 200,
    }) || errorRate.add(1);
    
    apiCalls.add(1);
    responseTime.add(response.timings.duration);
  }
  
  const totalTime = Date.now() - startTime;
  sleep(Math.max(0, 5 - totalTime / 1000)); // Ensure minimum 5 second session
}

function apiSustainedLoad() {
  const endpoints = [
    '/rest/v1/elections?select=id,office_name,state,election_dt&limit=50',
    '/rest/v1/candidates?select=id,name,party&limit=100',
    '/rest/v1/election_cycles?select=*',
    '/rest/v1/elections?select=*&election_dt=gte.2024-01-01',
  ];
  
  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const headers = SUPABASE_ANON_KEY ? {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  } : {};
  
  const response = http.get(`${SUPABASE_URL}${randomEndpoint}`, { headers });
  
  check(response, {
    'API request successful': (r) => r.status === 200,
    'API response fast': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
  
  apiCalls.add(1);
  responseTime.add(response.timings.duration);
}

function campaignDashboardBehavior() {
  const startTime = Date.now();
  
  // Simulate campaign manager checking analytics
  const headers = SUPABASE_ANON_KEY ? {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  } : {};
  
  // 1. Check campaign analytics
  let response = http.get(`${SUPABASE_URL}/rest/v1/engagement_metrics?select=*&limit=100`, {
    headers: headers
  });
  
  check(response, {
    'analytics load': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  apiCalls.add(1);
  responseTime.add(response.timings.duration);
  
  sleep(Math.random() * 3 + 2); // Longer viewing time for dashboards
  
  // 2. Check interaction logs
  response = http.get(`${SUPABASE_URL}/rest/v1/interaction_logs?select=*&limit=50&order=timestamp.desc`, {
    headers: headers
  });
  
  check(response, {
    'interaction logs load': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  apiCalls.add(1);
  responseTime.add(response.timings.duration);
  
  const totalTime = Date.now() - startTime;
  sleep(Math.max(0, 10 - totalTime / 1000)); // Minimum 10 second session for dashboard users
}

export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total API calls: ${apiCalls.count}`);
  console.log(`Average response time: ${responseTime.avg}ms`);
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
}
