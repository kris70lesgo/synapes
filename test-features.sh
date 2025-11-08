#!/bin/bash

# Comprehensive feature test with detailed checks

echo "🧪 Comprehensive Feature Testing"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

test_feature() {
    local feature=$1
    local url=$2
    local check=$3
    
    echo -e "${BLUE}Testing: $feature${NC}"
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$check"; then
        echo -e "${GREEN}✓ PASS${NC} - Feature working"
    else
        echo -e "${RED}✗ FAIL${NC} - Feature not working"
        echo "Response snippet: ${response:0:200}..."
    fi
    echo ""
}

echo "1️⃣  Testing Semantic Search..."
curl -s "$BASE_URL/api/playbooks/search?q=kubernetes" > /tmp/search_result.json
if grep -q "results" /tmp/search_result.json; then
    echo -e "${GREEN}✓ Semantic search working${NC}"
    echo "   Results count: $(jq '.count // 0' /tmp/search_result.json 2>/dev/null || echo "N/A")"
else
    echo -e "${RED}✗ Semantic search failed${NC}"
fi
echo ""

echo "2️⃣  Testing Analytics..."
curl -s "$BASE_URL/api/analytics" > /tmp/analytics.json
if grep -q "overview" /tmp/analytics.json; then
    echo -e "${GREEN}✓ Analytics working${NC}"
    echo "   Documents: $(jq '.overview.documents // 0' /tmp/analytics.json 2>/dev/null || echo "N/A")"
    echo "   Playbooks: $(jq '.overview.playbooks // 0' /tmp/analytics.json 2>/dev/null || echo "N/A")"
else
    echo -e "${RED}✗ Analytics failed${NC}"
fi
echo ""

echo "3️⃣  Testing Export (JSON)..."
curl -s "$BASE_URL/api/export?format=json" > /tmp/export.json
if [ -s /tmp/export.json ] && jq empty /tmp/export.json 2>/dev/null; then
    echo -e "${GREEN}✓ JSON export working${NC}"
    echo "   Playbooks exported: $(jq 'length' /tmp/export.json 2>/dev/null || echo "N/A")"
else
    echo -e "${RED}✗ JSON export failed${NC}"
fi
echo ""

echo "4️⃣  Testing Export (CSV)..."
curl -s "$BASE_URL/api/export?format=csv" > /tmp/export.csv
if [ -s /tmp/export.csv ] && head -1 /tmp/export.csv | grep -q "Task Name"; then
    echo -e "${GREEN}✓ CSV export working${NC}"
    echo "   Lines: $(wc -l < /tmp/export.csv)"
else
    echo -e "${RED}✗ CSV export failed${NC}"
fi
echo ""

echo "5️⃣  Testing Playbooks API..."
curl -s "$BASE_URL/api/playbooks" > /tmp/playbooks.json
if grep -q "playbooks" /tmp/playbooks.json; then
    echo -e "${GREEN}✓ Playbooks API working${NC}"
    echo "   Total: $(jq '.total // 0' /tmp/playbooks.json 2>/dev/null || echo "N/A")"
else
    echo -e "${RED}✗ Playbooks API failed${NC}"
fi
echo ""

echo "6️⃣  Testing Database Status..."
curl -s "$BASE_URL/api/extract" > /tmp/status.json
if grep -q "documents" /tmp/status.json; then
    echo -e "${GREEN}✓ Database status working${NC}"
    echo "   Status: $(jq -r '.status // "unknown"' /tmp/status.json 2>/dev/null || echo "N/A")"
else
    echo -e "${RED}✗ Database status failed${NC}"
fi
echo ""

# Cleanup
rm -f /tmp/search_result.json /tmp/analytics.json /tmp/export.json /tmp/export.csv /tmp/playbooks.json /tmp/status.json

echo "=================================="
echo "Feature testing complete!"
