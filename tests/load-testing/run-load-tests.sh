
#!/bin/bash

# Load Testing Runner for Election Countdown Platform
# Usage: ./run-load-tests.sh [scenario] [environment]

set -e

SCENARIO=${1:-"election_night"}
ENVIRONMENT=${2:-"staging"}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Load Test: $SCENARIO on $ENVIRONMENT${NC}"

# Environment configuration
case $ENVIRONMENT in
  "staging")
    BASE_URL="https://afce7e55-0b81-463a-ace0-821ebed0b1c5.lovableproject.com"
    SUPABASE_URL="https://viwrhnkkojgkclwnsxdb.supabase.co"
    ;;
  "production")
    echo -e "${RED}⚠️  Production load testing requires approval${NC}"
    read -p "Are you sure you want to run load tests against production? (y/N): " confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
      echo "Load test cancelled"
      exit 1
    fi
    BASE_URL="YOUR_PRODUCTION_URL"
    SUPABASE_URL="YOUR_PRODUCTION_SUPABASE_URL"
    ;;
  *)
    echo -e "${RED}Unknown environment: $ENVIRONMENT${NC}"
    exit 1
    ;;
esac

# Check if K6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}K6 is not installed. Please install it first:${NC}"
    echo "brew install k6  # macOS"
    echo "sudo apt install k6  # Ubuntu"
    echo "# Or download from https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Create results directory
RESULTS_DIR="./test-results/$(date +%Y%m%d-%H%M%S)-$SCENARIO"
mkdir -p "$RESULTS_DIR"

echo -e "${YELLOW}📊 Test configuration:${NC}"
echo "  Scenario: $SCENARIO"
echo "  Environment: $ENVIRONMENT"
echo "  Base URL: $BASE_URL"
echo "  Results: $RESULTS_DIR"
echo ""

# Pre-test health check
echo -e "${BLUE}🔍 Running pre-test health check...${NC}"
if curl -f -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Application is accessible${NC}"
else
    echo -e "${RED}❌ Application is not accessible at $BASE_URL${NC}"
    exit 1
fi

# Run the appropriate test scenario
case $SCENARIO in
  "election_night")
    echo -e "${YELLOW}🗳️  Running Election Night Peak Load Test${NC}"
    echo "  Target: 10,000 concurrent users"
    echo "  Duration: 65 minutes"
    echo "  Pattern: Ramp up → Peak → Sustain → Ramp down"
    
    K6_SCENARIO=election_night_peak \
    BASE_URL="$BASE_URL" \
    SUPABASE_URL="$SUPABASE_URL" \
    k6 run \
      --out json="$RESULTS_DIR/results.json" \
      --out csv="$RESULTS_DIR/results.csv" \
      ./election-night-load-test.js
    ;;
    
  "api_stress")
    echo -e "${YELLOW}⚡ Running API Stress Test${NC}"
    echo "  Target: 1M requests/hour (278 RPS)"
    echo "  Duration: 60 minutes"
    echo "  Focus: API endpoints sustained load"
    
    K6_SCENARIO=api_sustained_load \
    BASE_URL="$BASE_URL" \
    SUPABASE_URL="$SUPABASE_URL" \
    k6 run \
      --out json="$RESULTS_DIR/results.json" \
      --out csv="$RESULTS_DIR/results.csv" \
      ./election-night-load-test.js
    ;;
    
  "campaign_dashboard")
    echo -e "${YELLOW}📈 Running Campaign Dashboard Load Test${NC}"
    echo "  Target: 1,000 concurrent campaign users"
    echo "  Duration: 45 minutes"
    echo "  Focus: Analytics dashboard performance"
    
    K6_SCENARIO=campaign_dashboard_users \
    BASE_URL="$BASE_URL" \
    SUPABASE_URL="$SUPABASE_URL" \
    k6 run \
      --out json="$RESULTS_DIR/results.json" \
      --out csv="$RESULTS_DIR/results.csv" \
      ./election-night-load-test.js
    ;;
    
  "smoke")
    echo -e "${YELLOW}💨 Running Smoke Test${NC}"
    echo "  Quick validation with minimal load"
    
    k6 run \
      --vus 10 \
      --duration 2m \
      --out json="$RESULTS_DIR/results.json" \
      BASE_URL="$BASE_URL" \
      SUPABASE_URL="$SUPABASE_URL" \
      ./election-night-load-test.js
    ;;
    
  *)
    echo -e "${RED}Unknown scenario: $SCENARIO${NC}"
    echo "Available scenarios: election_night, api_stress, campaign_dashboard, smoke"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✅ Load test completed!${NC}"
echo -e "${BLUE}📊 Results saved to: $RESULTS_DIR${NC}"

# Generate summary report
if [ -f "$RESULTS_DIR/results.json" ]; then
    echo -e "${YELLOW}📋 Generating summary report...${NC}"
    
    # Extract key metrics from results
    echo "=== LOAD TEST SUMMARY ===" > "$RESULTS_DIR/summary.txt"
    echo "Scenario: $SCENARIO" >> "$RESULTS_DIR/summary.txt"
    echo "Environment: $ENVIRONMENT" >> "$RESULTS_DIR/summary.txt"
    echo "Date: $(date)" >> "$RESULTS_DIR/summary.txt"
    echo "" >> "$RESULTS_DIR/summary.txt"
    
    # Basic metrics extraction (requires jq)
    if command -v jq &> /dev/null; then
        echo "Response Times:" >> "$RESULTS_DIR/summary.txt"
        echo "  Average: $(jq -r '.metrics.http_req_duration.avg' "$RESULTS_DIR/results.json")ms" >> "$RESULTS_DIR/summary.txt"
        echo "  95th percentile: $(jq -r '.metrics.http_req_duration.p95' "$RESULTS_DIR/results.json")ms" >> "$RESULTS_DIR/summary.txt"
        echo "" >> "$RESULTS_DIR/summary.txt"
        echo "Error Rate: $(jq -r '.metrics.http_req_failed.rate' "$RESULTS_DIR/results.json")" >> "$RESULTS_DIR/summary.txt"
        echo "Total Requests: $(jq -r '.metrics.http_reqs.count' "$RESULTS_DIR/results.json")" >> "$RESULTS_DIR/summary.txt"
    fi
    
    cat "$RESULTS_DIR/summary.txt"
fi

echo ""
echo -e "${BLUE}💡 Next steps:${NC}"
echo "  1. Review detailed results in $RESULTS_DIR"
echo "  2. Check application logs for errors"
echo "  3. Monitor database performance"
echo "  4. Compare against performance targets"
echo ""
echo -e "${GREEN}🎯 Performance Targets:${NC}"
echo "  Response time (95th): < 2000ms"
echo "  Error rate: < 5%"
echo "  Throughput: > 500 RPS"
