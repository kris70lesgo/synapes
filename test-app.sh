#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Synapes Application${NC}\n"

BASE_URL="http://localhost:3000"
FAILED=0
PASSED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local expected_status=${4:-200}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
        ((FAILED++))
        return 1
    fi
}

# Function to test API with JSON response
test_api_json() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}✓ PASS${NC} (Found '$expected_field')"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Missing '$expected_field')"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo -e "${YELLOW}=== Frontend Pages ===${NC}"
test_endpoint "Home Page" "$BASE_URL/"
test_endpoint "Admin Panel" "$BASE_URL/admin"
test_endpoint "Playbooks Page" "$BASE_URL/playbooks"
test_endpoint "Analytics Page" "$BASE_URL/analytics"
test_endpoint "Upload Page" "$BASE_URL/upload"

echo -e "\n${YELLOW}=== API Endpoints ===${NC}"
test_api_json "Database Status" "$BASE_URL/api/extract" "documents"
test_api_json "Get Playbooks" "$BASE_URL/api/playbooks" "playbooks"
test_api_json "Analytics Data" "$BASE_URL/api/analytics" "overview"

echo -e "\n${YELLOW}=== Database Connection ===${NC}"
test_api_json "Test DB Connection" "$BASE_URL/api/test-db" "success"

echo -e "\n${YELLOW}=== Search Functionality ===${NC}"
test_api_json "Semantic Search" "$BASE_URL/api/playbooks/search?q=deploy" "results"

echo -e "\n${YELLOW}=== Export Functionality ===${NC}"
test_endpoint "Export JSON" "$BASE_URL/api/export?format=json"
test_endpoint "Export CSV" "$BASE_URL/api/export?format=csv"

echo -e "\n${BLUE}===========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${BLUE}===========================================${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC} 🎉"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed.${NC}"
    echo -e "${YELLOW}Make sure the dev server is running: npm run dev${NC}"
    exit 1
fi
