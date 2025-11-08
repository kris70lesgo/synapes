#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║   🔍 Synapes Quick Diagnostic Check           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

check_item() {
    local name=$1
    local condition=$2
    
    if eval "$condition"; then
        echo -e "   ${GREEN}✓${NC} $name"
        ((PASSED++))
    else
        echo -e "   ${RED}✗${NC} $name"
        ((FAILED++))
    fi
}

echo -e "${BLUE}📁 File Structure Check${NC}"
check_item ".env.local exists" "[ -f .env.local ]"
check_item "node_modules exists" "[ -d node_modules ]"
check_item "package.json exists" "[ -f package.json ]"
check_item ".next build dir exists" "[ -d .next ]"
echo ""

echo -e "${BLUE}📄 Critical Files${NC}"
check_item "lib/db.ts" "[ -f lib/db.ts ]"
check_item "lib/openai.ts" "[ -f lib/openai.ts ]"
check_item "lib/types.ts" "[ -f lib/types.ts ]"
echo ""

echo -e "${BLUE}🔌 API Routes${NC}"
check_item "api/playbooks/route.ts" "[ -f app/api/playbooks/route.ts ]"
check_item "api/extract/route.ts" "[ -f app/api/extract/route.ts ]"
check_item "api/analytics/route.ts" "[ -f app/api/analytics/route.ts ]"
check_item "api/export/route.ts" "[ -f app/api/export/route.ts ]"
check_item "api/upload/route.ts" "[ -f app/api/upload/route.ts ]"
check_item "api/playbooks/search/route.ts" "[ -f app/api/playbooks/search/route.ts ]"
echo ""

echo -e "${BLUE}📱 Frontend Pages${NC}"
check_item "app/page.tsx" "[ -f app/page.tsx ]"
check_item "app/admin/page.tsx" "[ -f app/admin/page.tsx ]"
check_item "app/playbooks/page.tsx" "[ -f app/playbooks/page.tsx ]"
check_item "app/analytics/page.tsx" "[ -f app/analytics/page.tsx ]"
check_item "app/upload/page.tsx" "[ -f app/upload/page.tsx ]"
echo ""

echo -e "${BLUE}⚙️  Configuration Files${NC}"
if [ -f .env.local ]; then
    if grep -q "DATABASE_URL" .env.local; then
        echo -e "   ${GREEN}✓${NC} DATABASE_URL configured"
        ((PASSED++))
    else
        echo -e "   ${RED}✗${NC} DATABASE_URL missing in .env.local"
        ((FAILED++))
    fi
    
    if grep -q "OPENROUTER_API_KEY" .env.local; then
        echo -e "   ${GREEN}✓${NC} OPENROUTER_API_KEY configured"
        ((PASSED++))
    else
        echo -e "   ${RED}✗${NC} OPENROUTER_API_KEY missing in .env.local"
        ((FAILED++))
    fi
else
    echo -e "   ${RED}✗${NC} .env.local not found"
    ((FAILED++))
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}🧪 Test Scripts${NC}"
check_item "test-app.sh" "[ -f test-app.sh ]"
check_item "test-features.sh" "[ -f test-features.sh ]"
check_item "test-all.sh" "[ -f test-all.sh ]"
echo ""

echo "╔════════════════════════════════════════════════╗"
echo -e "║  ${GREEN}Passed: $PASSED${NC}  ${RED}Failed: $FAILED${NC}                      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Ready to test.${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. npm run dev"
    echo "   2. Open http://localhost:3000"
    echo "   3. See TEST_RESULTS.md for detailed testing"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed.${NC}"
    echo ""
    echo "📝 Fix the issues above, then:"
    echo "   - Run 'npm install' if node_modules is missing"
    echo "   - Check .env.local has correct keys"
    echo "   - Ensure all files are created"
    exit 1
fi
