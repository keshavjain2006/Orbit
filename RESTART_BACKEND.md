# 🔄 How to Fix "User postgres was denied access" Error

## ✅ The Problem
Your backend server is still using the old database connection string. The `.env` file has been fixed, but the server needs to be restarted.

## 🚀 Quick Fix (3 Steps)

### Step 1: Stop the Backend Server
In Terminal 1 (where backend is running):
- Press `Ctrl+C` to stop the server

Or if it's not responding:
```bash
pkill -f "tsx watch"
# or
lsof -ti:3000 | xargs kill -9
```

### Step 2: Verify .env is Correct
```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
cat .env | grep DATABASE_URL
```

Should show:
```
DATABASE_URL="postgresql://keshavjain@localhost:5432/proximity_app?schema=public"
```

### Step 3: Restart the Backend
```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
npm run dev
```

Wait for: `🚀 Server running on port 3000`

## ✅ Verify It's Fixed

1. **Test the connection:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Try creating a user in your app** - it should work now!

## 🐛 If Still Not Working

If you still see the error after restarting:

1. **Clear Prisma cache:**
   ```bash
   cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
   rm -rf node_modules/.prisma
   npm run prisma:generate
   ```

2. **Restart backend again:**
   ```bash
   npm run dev
   ```

---

**Note:** The `.env` file has already been fixed. You just need to restart the backend server to pick up the new connection string.

