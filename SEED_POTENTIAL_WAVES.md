# 🌊 Seed Potential Waves - Quick Guide

## ✅ What This Does

This script creates **3-5 encounters** between your user and other users (Alex Morgan, Sam Chen, Jordan Taylor, Casey Johnson, Morgan Lee) so they appear in your "Potential Waves" list.

## 🚀 How to Use

### Step 1: Run the Seed Script

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
npm run seed:waves
```

**Expected Output:**
```
✅ Found your user: [Your Name] ([Your ID])
📋 Found 5 target users to create encounters with
📝 Creating encounters...
✅ Created 21 encounters total!
📊 Found 5 qualifying pairs:
  ✅ Alex Morgan: 5 encounters
  ✅ Sam Chen: 4 encounters
  ...
```

### Step 2: Check Your App

1. **Open your app** (make sure frontend is running)
2. **Go to Home screen**
3. **You should see "Potential Waves"** with:
   - Alex Morgan
   - Sam Chen
   - Jordan Taylor
   - Casey Johnson
   - Morgan Lee

### Step 3: Wave at Someone

1. **Click on a person** in Potential Waves (e.g., Alex Morgan)
2. **Click "Wave at [Name]"**
3. This will:
   - Record another encounter
   - Create a connection request (if you now have 3+ encounters)

### Step 4: Check Prisma Studio

1. **Open Prisma Studio:**
   ```bash
   cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
   npm run prisma:studio
   ```

2. **Click on `connection_requests` table**
3. **You should see pending connection requests!** 🎉

## 🔄 Re-run Anytime

If you want to reset and create new encounters:

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
npm run seed:waves
```

The script will:
- Find your most recent user (or user named "H")
- Create 3-5 encounters with each target user
- Show you which pairs qualify for connection requests

## 📊 Verify It Worked

### Check Encounters:
```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Get your user ID
psql -d proximity_app -c "SELECT id, name FROM users ORDER BY created_at DESC LIMIT 1;"

# Check encounters (replace YOUR_USER_ID)
psql -d proximity_app -c "
SELECT 
  u1.name as user1, 
  u2.name as user2, 
  COUNT(*) as encounters
FROM encounters e 
JOIN users u1 ON e.user1_id = u1.id 
JOIN users u2 ON e.user2_id = u2.id 
WHERE e.user1_id = 'YOUR_USER_ID' OR e.user2_id = 'YOUR_USER_ID'
GROUP BY u1.name, u2.name
HAVING COUNT(*) >= 3;
"
```

### Check Potential Waves API:
```bash
curl http://localhost:3000/api/encounters/check-requests | jq '.data | length'
# Should return: 5 (or more)
```

## 🎯 Create Connection Requests

After waving, connection requests are created automatically. Or manually:

```bash
curl -X POST http://localhost:3000/api/connections/create-requests
```

Then check Prisma Studio to see them!

## 💡 Tips

- **Each wave records an encounter** - so wave 3 times to create a connection request
- **Connection requests appear in Prisma Studio** in the `connection_requests` table
- **Both users need to accept** before a connection is established
- **Encounters expire after 14 days** - so re-run the script if needed

---

**That's it!** Now you have default people in Potential Waves to test with! 🎉

