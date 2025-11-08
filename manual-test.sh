#!/bin/bash

# Simple manual test to verify app functionality

echo "🔍 Manual Test Suite for Synapes"
echo "================================="
echo ""

# Test 1: Check if .env.local exists
echo "1️⃣  Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "   ✓ .env.local exists"
    if grep -q "DATABASE_URL" .env.local && grep -q "OPENROUTER_API_KEY" .env.local; then
        echo "   ✓ Required environment variables found"
    else
        echo "   ✗ Missing environment variables"
    fi
else
    echo "   ✗ .env.local not found"
fi
echo ""

# Test 2: Check if node_modules exists
echo "2️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules directory exists"
else
    echo "   ✗ node_modules not found - run 'npm install'"
fi
echo ""

# Test 3: Check critical files
echo "3️⃣  Checking critical files..."
files=(
    "lib/db.ts"
    "lib/openai.ts"
    "lib/types.ts"
    "app/api/playbooks/route.ts"
    "app/api/extract/route.ts"
    "app/api/analytics/route.ts"
    "app/api/export/route.ts"
    "app/api/upload/route.ts"
    "app/playbooks/page.tsx"
    "app/admin/page.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ $file missing"
    fi
done
echo ""

# Test 4: Check if server is running
echo "4️⃣  Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✓ Server is running on port 3000"
else
    echo "   ✗ Server is not running"
    echo "   💡 Start it with: npm run dev"
fi
echo ""

echo "================================="
echo "Manual test complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Make sure .env.local has your API keys"
echo "   2. Run 'npm install' if node_modules is missing"
echo "   3. Run 'npm run dev' to start the server"
echo "   4. Open http://localhost:3000 in your browser"
