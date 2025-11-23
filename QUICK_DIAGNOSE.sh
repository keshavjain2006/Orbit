#!/bin/bash

# Quick Diagnostic Script for API Errors
# Run this to check if everything is set up correctly

echo "🔍 Diagnosing API Connection Issues..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Backend running
echo "1️⃣  Checking if backend is running..."
if curl -s http://localhost:3000/api/users > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo "   → Start it: cd Orbit/backend && npm run dev"
fi
echo ""

# Check 2: Database connection
echo "2️⃣  Checking database connection..."
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
if psql -d proximity_app -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is accessible${NC}"
    USER_COUNT=$(psql -d proximity_app -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
    echo "   → Users in database: $USER_COUNT"
else
    echo -e "${RED}❌ Database is NOT accessible${NC}"
    echo "   → Check if PostgreSQL is running"
fi
echo ""

# Check 3: API endpoint test
echo "3️⃣  Testing API endpoint..."
RESPONSE=$(curl -s http://localhost:3000/api/users 2>&1)
if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ API endpoint is responding correctly${NC}"
else
    echo -e "${YELLOW}⚠️  API endpoint response:${NC}"
    echo "$RESPONSE" | head -3
fi
echo ""

# Check 4: IP address
echo "4️⃣  Checking IP address..."
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "   → Your IP: $IP"
echo "   → Make sure api.js uses: http://$IP:3000/api"
echo ""

# Check 5: Network connectivity
echo "5️⃣  Testing network connectivity..."
if ping -c 1 172.16.4.209 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Network is reachable${NC}"
else
    echo -e "${YELLOW}⚠️  Could not ping IP address${NC}"
fi
echo ""

echo "📋 Summary:"
echo "   → If backend is running ✅ and database is accessible ✅,"
echo "     the issue is likely in the frontend connection."
echo ""
echo "   → Check Terminal 1 (Backend) for error logs"
echo "   → Check Terminal 3 (Frontend) for connection errors"
echo ""

