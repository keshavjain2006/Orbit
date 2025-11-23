# 🌱 Seed Dummy Profiles for Testing

## Quick Start

This script creates dummy profiles that will show up as:
- **Potential Waves** (users with 3+ encounters in last 14 days)
- **Friends** (active connections with conversations)

---

## 🚀 Run the Script

**In Terminal (Backend directory):**
```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
npm run seed:dummy
```

---

## 📊 What Gets Created

### 👥 6 Dummy Users:
1. **Alex Morgan** (they/them) - "Love hiking and coffee!"
2. **Sam Chen** (he/him) - "Tech enthusiast and bookworm"
3. **Jordan Taylor** (she/her) - "Artist and music lover"
4. **Riley Kim** (they/them) - "Fitness enthusiast and foodie"
5. **Casey Johnson** (he/him) - "Gamer and movie buff"
6. **Morgan Lee** (she/her) - "Yoga instructor and wellness coach"

### 📍 Potential Waves (Encounters):
- **Alex ↔ Sam**: 5 encounters (qualifies!)
- **Alex ↔ Jordan**: 4 encounters (qualifies!)
- **Sam ↔ Riley**: 3 encounters (qualifies!)
- **Jordan ↔ Casey**: 3 encounters (qualifies!)

### 🤝 Friends (Active Connections):
- **Alex ↔ Riley**: Connected with conversation
- **Sam ↔ Casey**: Connected with conversation
- **Jordan ↔ Morgan**: Connected with conversation

### 💬 Conversations & Messages:
- Each friend connection has a conversation
- Each conversation has 2 messages

---

## ✅ Verify in Prisma Studio

1. **Open Prisma Studio:**
   ```bash
   cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
   npm run prisma:studio
   ```

2. **Check:**
   - **Users** table → Should see 6 new users
   - **Encounters** table → Should see encounters from last 14 days
   - **Connections** table → Should see 3 active connections
   - **Conversations** table → Should see 3 conversations
   - **Messages** table → Should see 6 messages

---

## 🎯 How to See in App

### Option 1: Login as One of the Dummy Users
1. Get a user ID from Prisma Studio
2. Modify your login to use that ID
3. You'll see potential waves and friends!

### Option 2: Create Encounters with Dummy Users
1. Get your user ID from Prisma Studio
2. Get a dummy user ID (e.g., `11111111-1111-1111-1111-111111111111` for Alex)
3. Create encounters via API:
   ```bash
   curl -X POST http://localhost:3000/api/encounters \
     -H "Content-Type: application/json" \
     -d '{
       "user1Id": "YOUR_USER_ID",
       "user2Id": "11111111-1111-1111-1111-111111111111"
     }'
   ```
4. Repeat 3+ times to create a potential wave

### Option 3: Create Connection with Dummy User
1. Get your user ID
2. Get a dummy user ID
3. Create connection via API:
   ```bash
   # First, create connection request (if needed)
   # Then accept it to create active connection
   ```

---

## 🔄 Re-run the Script

The script uses `upsert`, so you can run it multiple times safely:
- Existing users won't be duplicated
- New encounters/connections will be added

**To start fresh:**
1. Delete data in Prisma Studio, OR
2. Uncomment the delete statements at the top of the script

---

## 📝 User IDs Reference

After running the script, you'll see these IDs:
- `dummy-user-1` - Alex Morgan
- `dummy-user-2` - Sam Chen
- `dummy-user-3` - Jordan Taylor
- `dummy-user-4` - Riley Kim
- `dummy-user-5` - Casey Johnson
- `dummy-user-6` - Morgan Lee

---

## 🎯 Testing Scenarios

### Test Potential Waves:
1. Login as `11111111-1111-1111-1111-111111111111` (Alex)
2. Should see:
   - Sam Chen (5 encounters)
   - Jordan Taylor (4 encounters)

### Test Friends:
1. Login as `11111111-1111-1111-1111-111111111111` (Alex)
2. Should see:
   - Riley Kim (friend with conversation)

### Test in Prisma Studio:
1. Check `encounters` table
2. Filter by `encountered_at >= NOW() - INTERVAL '14 days'`
3. Group by `user1_id, user2_id`
4. Should see pairs with 3+ encounters

---

## ✅ Success Indicators

After running the script, you should see:
```
✅ Created 6 users
✅ Created encounters for potential waves
✅ Created active connections
✅ Created conversations
✅ Created messages
✅ Dummy profiles seeded successfully!
```

**Then check Prisma Studio to verify all data is there!** 🎉

