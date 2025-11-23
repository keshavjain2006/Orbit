# 🌊 How Waving Works in Orbit

## The Problem You Encountered

When you "wave" at Alex Morgan, no connection request appears in Prisma Studio because:

**Connection requests are only created after 3+ encounters in 14 days!**

## How It Works

### Step 1: Record Encounters
- Each time you "wave" at someone, it records an **encounter** between you two
- Encounters are stored in the `encounters` table

### Step 2: Qualify for Connection Request
- After **3 or more encounters** within **14 days**, you qualify for a connection request
- The system automatically creates a connection request when you wave (if you qualify)

### Step 3: Connection Request Created
- Once you have 3+ encounters, waving will create a connection request
- This appears in the `connection_requests` table in Prisma Studio

## What I Fixed

I updated the "wave" button to:
1. ✅ **First record an encounter** between you and the person
2. ✅ **Then create connection requests** for all qualifying pairs (including yours if you now have 3+ encounters)

## How to Test

### Option 1: Wave 3 Times
1. Wave at Alex Morgan (encounter #1 recorded)
2. Wave at Alex Morgan again (encounter #2 recorded)
3. Wave at Alex Morgan a third time (encounter #3 recorded → connection request created!)

### Option 2: Check Current Encounters
```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Check your encounters with Alex Morgan
psql -d proximity_app -c "
SELECT 
  u1.name as user1, 
  u2.name as user2, 
  COUNT(*) as encounters,
  MAX(e.encountered_at) as last_encounter
FROM encounters e 
JOIN users u1 ON e.user1_id = u1.id 
JOIN users u2 ON e.user2_id = u2.id 
WHERE (u1.name = 'H' OR u2.name = 'H')
  AND (u1.name = 'Alex Morgan' OR u2.name = 'Alex Morgan')
GROUP BY u1.name, u2.name;
"
```

### Option 3: Manually Create Test Encounters
```bash
# Get your user ID and Alex Morgan's ID
psql -d proximity_app -c "SELECT id, name FROM users WHERE name IN ('H', 'Alex Morgan');"

# Then use the API to record encounters:
curl -X POST http://localhost:3000/api/encounters \
  -H "Content-Type: application/json" \
  -d '{
    "user1Id": "YOUR_USER_ID",
    "user2Id": "ALEX_MORGAN_ID"
  }'

# Do this 3 times, then wave - connection request will be created!
```

## Check Connection Requests

After waving 3 times, check Prisma Studio:
1. Open Prisma Studio: `cd backend && npm run prisma:studio`
2. Click on `connection_requests` table
3. You should see a pending request between you and Alex Morgan!

## Summary

- ✅ **Fixed**: Wave button now records encounters first
- ✅ **Requirement**: Need 3+ encounters in 14 days to create connection request
- ✅ **Next Step**: Wave at Alex Morgan 3 times to see the connection request appear!

