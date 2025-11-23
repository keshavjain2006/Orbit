# 🎯 Quick Guide: View Dummy Profiles in Real-Time

## ✅ Dummy Profiles Created!

The script has successfully created:
- **6 dummy users** with profiles
- **Encounters** that qualify for potential waves (3+ in 14 days)
- **Active connections** (friends) with conversations
- **Messages** in conversations

---

## 🔍 View in Prisma Studio

1. **Open Prisma Studio:**
   ```bash
   cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
   npm run prisma:studio
   ```

2. **Check each table:**
   - **Users** → See 6 dummy users (Alex, Sam, Jordan, Riley, Casey, Morgan)
   - **Encounters** → See encounters from last 14 days
   - **Connections** → See 3 active connections (friends)
   - **Conversations** → See 3 conversations
   - **Messages** → See 6 messages

---

## 📱 View in Your App

### Option 1: Login as a Dummy User

1. **Get a dummy user ID** from Prisma Studio (e.g., `11111111-1111-1111-1111-111111111111`)

2. **Modify your login** to use that ID, OR

3. **Create encounters with your user:**
   ```bash
   # Replace YOUR_USER_ID with your actual user ID
   curl -X POST http://localhost:3000/api/encounters \
     -H "Content-Type: application/json" \
     -d '{
       "user1Id": "YOUR_USER_ID",
       "user2Id": "11111111-1111-1111-1111-111111111111"
     }'
   ```
   Repeat 3+ times to create a potential wave!

---

## 🎯 What You Should See

### Potential Waves:
- **Alex ↔ Sam**: 5 encounters ✅
- **Alex ↔ Jordan**: 4 encounters ✅
- **Sam ↔ Riley**: 3 encounters ✅
- **Jordan ↔ Casey**: 3 encounters ✅

### Friends:
- **Alex ↔ Riley**: Connected with conversation
- **Sam ↔ Casey**: Connected with conversation
- **Jordan ↔ Morgan**: Connected with conversation

---

## 🔄 Refresh Data

**In your app:**
- Pull down to refresh (if implemented)
- Or navigate away and back to home screen
- Or restart the app

**In Prisma Studio:**
- Click the refresh button (🔄) in the top right
- Or close and reopen Prisma Studio

---

## 📝 User IDs Quick Reference

| Name | ID |
|------|-----|
| Alex Morgan | `11111111-1111-1111-1111-111111111111` |
| Sam Chen | `22222222-2222-2222-2222-222222222222` |
| Jordan Taylor | `33333333-3333-3333-3333-333333333333` |
| Riley Kim | `44444444-4444-4444-4444-444444444444` |
| Casey Johnson | `55555555-5555-5555-5555-555555555555` |
| Morgan Lee | `66666666-6666-6666-6666-666666666666` |

---

## ✅ Verify It's Working

1. **Check Prisma Studio** → All tables should have data
2. **Check your app** → Should see potential waves and friends
3. **Check backend logs** → No errors when loading home data

**Everything should be working now!** 🎉

