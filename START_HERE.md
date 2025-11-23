# 🚀 START HERE - Run Orbit App

## Quick Start (3 Commands)

### Terminal 1: Backend
```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
npm run dev
```
✅ Wait for: `🚀 Server running on port 3000`

### Terminal 2: Frontend
```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new
npm start
```
✅ Press `i` (iOS), `a` (Android), or `w` (web)

### Terminal 3: Get User IDs (for Postman)
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -d proximity_app -c "SELECT id, username FROM users;"
```

---

## 📚 Full Guides

- **`STEP_BY_STEP_RUN_GUIDE.md`** - Complete step-by-step instructions
- **`COMPLETE_SETUP_GUIDE.md`** - Detailed setup and testing guide
- **`QUICK_START.md`** - Quick reference

---

## 🧪 Test with Postman

1. **Import Collection**: 
   - Open Postman
   - Click "Import"
   - Select `POSTMAN_COLLECTION.json`
   - All requests are ready!

2. **Update Variables**:
   - Click on collection → Variables
   - Update `alice_id`, `bob_id`, `conversation_id` with actual IDs

3. **Start Testing**:
   - Click "Health Check" → Send
   - Try other requests!

---

## ✅ Everything Working?

- [ ] Backend running (Terminal 1)
- [ ] Frontend running (Terminal 2)
- [ ] App opens
- [ ] Postman requests work
- [ ] Can send messages

**You're all set!** 🎉

