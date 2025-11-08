#!/bin/bash

# Test database connectivity and data

echo "🗄️  Testing Database..."
echo ""

# Check if Tiger CLI exists
if [ -f "/home/agastya/.local/bin/tiger" ]; then
    echo "✓ Tiger CLI found"
else
    echo "✗ Tiger CLI not found"
    exit 1
fi

# Test connection and queries
echo ""
echo "Testing database queries..."

# Count documents
echo -n "Documents count: "
psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM documents;" 2>/dev/null || echo "Failed to connect"

# Count playbooks
echo -n "Playbooks count: "
psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM playbooks;" 2>/dev/null || echo "Failed to connect"

# Count feedback
echo -n "Feedback count: "
psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM feedback;" 2>/dev/null || echo "Failed to connect"

# Check tables exist
echo ""
echo "Checking tables..."
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>/dev/null

# Check vector extension
echo ""
echo "Checking pgvector extension..."
psql "$DATABASE_URL" -c "SELECT * FROM pg_extension WHERE extname = 'vector';" 2>/dev/null

echo ""
echo "Database test complete!"
