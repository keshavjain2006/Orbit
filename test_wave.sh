#!/bin/bash
# Quick test script to create 3 encounters between you and Alex Morgan
# This will allow you to see a connection request appear in Prisma Studio

export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

YOUR_USER_ID="f16abb0e-6b70-42ec-96f6-d53d99fdde8b"
ALEX_MORGAN_ID="11111111-1111-1111-1111-111111111111"

echo "🌊 Creating 3 encounters between you and Alex Morgan..."
echo ""

for i in {1..3}; do
  echo "Creating encounter #$i..."
  curl -X POST http://localhost:3000/api/encounters \
    -H "Content-Type: application/json" \
    -d "{
      \"user1Id\": \"$YOUR_USER_ID\",
      \"user2Id\": \"$ALEX_MORGAN_ID\"
    }" 2>/dev/null | jq -r '.message // .error // .' || echo "  ⚠️  Encounter $i created (or duplicate)"
  sleep 0.5
done

echo ""
echo "✅ Done! Now creating connection requests..."
curl -X POST http://localhost:3000/api/connections/create-requests \
  -H "Content-Type: application/json" 2>/dev/null | jq '.'

echo ""
echo "🎉 Check Prisma Studio - you should see a connection request now!"
echo "   Run: cd backend && npm run prisma:studio"

