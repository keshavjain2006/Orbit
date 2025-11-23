# 🧪 Test Connection Requests - Complete Guide

## ✅ What's Been Set Up

I've added **6 default test users** to your database that will appear in your app's "Potential Waves" section:

1. **Alex Morgan** (they/them) - Love hiking and coffee! 🏔️☕
2. **Sam Chen** (he/him) - Tech enthusiast and bookworm 💻📚
3. **Jordan Taylor** (she/her) - Designer & runner 🎨🏃‍♀️
4. **Riley Kim** (they/them) - Foodie exploring the city 🍕☕
5. **Casey Johnson** (he/him) - Musician and photographer 🎵📸
6. **Morgan Lee** (she/her) - Yoga instructor and travel lover 🧘‍♀️✈️

**All of these users already have 3+ encounters with your user**, so they will appear in "Potential Waves"!

## 🚀 How to Test

### Step 1: Open Your App

1. Make sure your **frontend is running**:
   ```bash
   cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new
   npm start
   ```

2. **Open the app** on your device/simulator

3. **Go to Home screen** - You should see "Potential Waves" section with all 6 users!

### Step 2: Wave at Someone

1. **Click on a person** in Potential Waves (e.g., "Alex Morgan")
2. **Click "Wave at [Name]"** button
3. This will:
   - Record another encounter
   - Create a connection request (if you now have 3+ encounters)
   - Show "Wave sent!" message

### Step 3: Check Prisma Studio

1. **Open Prisma Studio**:
   ```bash
   cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
   npm run prisma:studio
   ```

2. **Click on `connection_requests` table**
3. **You should see connection requests appear!** 🎉
   - Status: `pending`
   - Shows requester and requested users
   - Created timestamp

### Step 4: Verify in Database

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Check connection requests
psql -d proximity_app -c "
SELECT 
  u1.name as requester, 
  u2.name as requested, 
  cr.status, 
  cr.created_at 
FROM connection_requests cr 
JOIN users u1 ON cr.requester_id = u1.id 
JOIN users u2 ON cr.requested_id = u2.id 
WHERE cr.status = 'pending'
ORDER BY cr.created_at DESC;
"
```

## 📊 Current Status

✅ **6 test users** created in database
✅ **22 encounters** created (3-5 per user)
✅ **10 connection requests** already created
✅ **All users qualify** for Potential Waves (3+ encounters)

## 🔄 Re-run Setup Anytime

If you want to reset and create fresh encounters:

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
npm run seed:default
```

This will:
- Update/create the 6 test users
- Create fresh encounters with your current user
- Create connection requests automatically

## 🎯 What Happens When You Wave

1. **Encounter is recorded** → Added to `encounters` table
2. **Connection request is created** (if 3+ encounters) → Added to `connection_requests` table
3. **Visible in Prisma Studio** → You can see it in real-time!

## 💡 Tips

- **Each wave = 1 encounter** - Wave 3 times to create a connection request
- **Connection requests are pending** until both users accept
- **Check Prisma Studio** to see all connection requests
- **Encounters expire after 14 days** - re-run script if needed

## 🐛 Troubleshooting

### Don't see users in Potential Waves?
- Make sure backend is running: `curl http://localhost:3000/health`
- Check encounters exist: Run `npm run seed:default` again
- Check your user ID matches in the app

### Connection requests not appearing?
- Make sure you have 3+ encounters with that user
- Check Prisma Studio is connected to the right database
- Try waving again (it records another encounter)

### Want to see all encounters?
```bash
psql -d proximity_app -c "
SELECT 
  u1.name as user1, 
  u2.name as user2, 
  COUNT(*) as encounters,
  MAX(e.encountered_at) as last_encounter
FROM encounters e 
JOIN users u1 ON e.user1_id = u1.id 
JOIN users u2 ON e.user2_id = u2.id 
GROUP BY u1.name, u2.name
HAVING COUNT(*) >= 3
ORDER BY encounters DESC;
"
```

---

**Everything is ready!** Open your app, wave at people, and watch connection requests appear in Prisma Studio! 🎉

