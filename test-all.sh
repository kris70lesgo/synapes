#!/bin/bash

# Master test script - runs all tests

echo "🚀 Running All Tests for Synapes"
echo "================================="
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Dev server is not running!"
    echo "Please start it with: npm run dev"
    exit 1
fi

echo "✓ Dev server is running"
echo ""

# Run basic app tests
echo "📱 Running App Tests..."
./test-app.sh
APP_RESULT=$?
echo ""

# Run feature tests
echo "🔧 Running Feature Tests..."
./test-features.sh
FEATURE_RESULT=$?
echo ""

# Summary
echo "================================="
echo "📊 Test Summary"
echo "================================="

if [ $APP_RESULT -eq 0 ]; then
    echo "✓ App Tests: PASSED"
else
    echo "✗ App Tests: FAILED"
fi

if [ $FEATURE_RESULT -eq 0 ]; then
    echo "✓ Feature Tests: PASSED"
else
    echo "✗ Feature Tests: FAILED"
fi

echo "================================="

if [ $APP_RESULT -eq 0 ] && [ $FEATURE_RESULT -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed"
    exit 1
fi
