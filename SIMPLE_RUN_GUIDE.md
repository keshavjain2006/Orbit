# 🚀 Simple Guide: How to Run Orbit App

## 🎯 Complete Guide: How to Run and Check Your Whole Project

This guide will help you set up, run, and verify your entire Orbit project from scratch.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js** installed (v18 or higher)
- [ ] **PostgreSQL** installed and running
- [ ] **npm** installed
- [ ] **Expo CLI** (installed automatically with npm)

### Check Prerequisites:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if PostgreSQL is running
brew services list | grep postgresql
```

---

## 🔧 Initial Setup (One-Time)

### Step 1: Set Up Database

```bash
# Navigate to database directory
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/database

# Make setup script executable
chmod +x setup.sh

# Run database setup
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
./setup.sh
```

**Expected Output:** `Database setup complete!`

### Step 2: Configure Backend Environment

```bash
# Navigate to backend
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend

# Create .env file from example
cp env.example .env

# IMPORTANT: Update DATABASE_URL to use your system username
# On macOS with Homebrew PostgreSQL, the default user is your system username
# Replace 'keshavjain' with your actual username if different
sed -i '' 's|postgres:password|keshavjain|g' .env

# Or manually edit .env and change:
# DATABASE_URL="postgresql://keshavjain@localhost:5432/proximity_app?schema=public"
# (Remove password, use your system username instead of 'postgres')
```

### Step 3: Install Backend Dependencies

```bash
# Still in backend directory
npm install

# Generate Prisma client
npm run prisma:generate
```

### Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new

# Install dependencies
npm install
```

---

## 🚀 Running Your Project (3 Terminals)

Now that everything is set up, you need **3 separate terminals** running simultaneously:

---

### **Terminal 1: Backend Server** ✅

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
npm run dev
```

**✅ Success Indicators:**

- You see: `🚀 Server running on port 3000`
- No error messages
- Server stays running (don't close this terminal!)

**❌ If you see errors:**

- Database connection error → Check PostgreSQL is running: `brew services start postgresql@15`
- Port 3000 in use → Kill the process: `lsof -ti:3000 | xargs kill`
- Missing dependencies → Run `npm install` again

---

### **Terminal 2: Frontend App** ✅

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new
npm start
```

**✅ Success Indicators:**

- Expo DevTools opens in browser
- QR code appears in terminal
- You see: `Metro waiting on...`

**Then choose your platform:**

- Press `i` → Opens iOS Simulator
- Press `a` → Opens Android Emulator
- Press `w` → Opens in Web Browser
- Scan QR code → Opens in Expo Go app on your phone

**❌ If you see errors:**

- Can't connect to backend → Make sure Terminal 1 is running
- Port conflict → Kill Expo: `pkill -f "expo start"` and try again
- Missing dependencies → Run `npm install` again

---

### **Terminal 3: Prisma Studio (Database Viewer)** ✅

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
npm run prisma:studio
```

**✅ Success Indicators:**

- Browser automatically opens at `http://localhost:5555`
- You see database tables (Users, Encounters, Connections, etc.)
- No error messages

**❌ If you see errors:**

- Port 5555 in use → Kill it: `pkill -f "prisma studio"` and restart
- Database connection error → Check Terminal 1 is running

---

## ✅ Verification: How to Check Everything Works

### 1. **Check Backend is Running**

Open browser and visit: `http://localhost:3000/health`

**Expected:** You should see a JSON response like:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-23T03:36:24.783Z"
}
```

✅ **If you see this response, your backend is working correctly!**

### 2. **Check Database Connection**

In Prisma Studio (Terminal 3):

- Click on "User" table
- You should see the table structure
- If you have data, you'll see rows

### 3. **Check Frontend Connection**

In your app (from Terminal 2):

- App should load without errors
- You should be able to navigate screens
- Try creating a profile

### 4. **Test Full Flow: Create a Profile**

1. **In your app** (Terminal 2):

   - Enter phone number
   - Enter name
   - Enter pronouns (optional)
   - Enter bio (optional)
   - Click "Complete Profile"

2. **Verify in Prisma Studio** (Terminal 3):

   - Click on "User" table
   - **You should see your new user appear!** ✅
   - Data updates in real-time

3. **Verify in Backend** (Terminal 1):
   - You should see log messages showing the API request
   - No error messages

---

## 🧪 Additional Testing Options

### Option 1: Test API with cURL

```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/api/users

# Create a user (example)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890","name":"Test User"}'
```

### Option 2: Test with Postman

1. Import `POSTMAN_COLLECTION.json` into Postman
2. Update variables (user IDs, etc.)
3. Test endpoints one by one

### Option 3: Run Backend Test Scripts

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend

# Seed test data
npm run test:seed

# Run test queries
npm run test:queries

# Run all tests
npm run test:all
```

---

## 📊 Complete Status Checklist

Use this checklist to verify everything is working:

- [ ] **Prerequisites:** Node.js, PostgreSQL, npm installed
- [ ] **Database:** Setup script ran successfully
- [ ] **Backend:** `.env` file created and configured
- [ ] **Backend:** Dependencies installed (`npm install`)
- [ ] **Backend:** Prisma client generated
- [ ] **Frontend:** Dependencies installed (`npm install`)
- [ ] **Terminal 1:** Backend running on port 3000
- [ ] **Terminal 2:** Frontend running (app open)
- [ ] **Terminal 3:** Prisma Studio open on port 5555
- [ ] **Health Check:** `http://localhost:3000/health` returns OK
- [ ] **Database:** Can view tables in Prisma Studio
- [ ] **App:** Can create a profile
- [ ] **Verification:** Profile appears in database

**If all checked ✅ → Your project is fully working!** 🎉

---

## 🐛 Troubleshooting Common Issues

### Backend Issues

**Problem:** `Cannot connect to database`

```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@15

# Verify connection
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -d proximity_app -c "SELECT 1;"
```

**Problem:** `Port 3000 already in use`

```bash
# Find and kill process
lsof -ti:3000 | xargs kill

# Or change port in .env file
# PORT=3001
```

**Problem:** `Prisma Client not generated`

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
npm run prisma:generate
```

### Frontend Issues

**Problem:** `Can't connect to backend`

- Make sure Terminal 1 (backend) is running
- Check backend URL in `services/api.js`
- If using physical device, update IP address in API config

**Problem:** `Expo port conflict`

```bash
# Kill Expo
pkill -f "expo start"

# Clear cache and restart
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new
npm start -- --clear
```

**Problem:** `Module not found`

```bash
# Reinstall dependencies
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new
rm -rf node_modules
npm install
```

### Database Issues

**Problem:** `Table does not exist`

```bash
# Re-run database setup
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/database
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
./setup.sh
```

**Problem:** `Prisma Studio won't start` or `Unable to process count query` or `User postgres was denied access`

This is usually a database connection/permission issue.

```bash
# Step 1: Fix DATABASE_URL in .env file
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend

# Check your system username
whoami

# Update .env to use your username instead of 'postgres:password'
# Replace 'keshavjain' with your actual username from 'whoami' command
sed -i '' 's|postgres:password|keshavjain|g' .env

# Verify the change
cat .env | grep DATABASE_URL
# Should show: DATABASE_URL="postgresql://keshavjain@localhost:5432/proximity_app?schema=public"

# Step 2: Regenerate Prisma client
npm run prisma:generate

# Step 3: Test Prisma connection
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.user.count().then(c => { console.log('✅ Count:', c); p.\$disconnect(); }).catch(e => { console.error('❌', e.message); p.\$disconnect(); });"

# Step 4: Kill and restart Prisma Studio
pkill -f "prisma studio"
npm run prisma:studio
```

**If still having issues:**

- Verify database user: `psql -d proximity_app -c "SELECT current_user;"`
- Check `.env` file has correct username (no password needed for local superuser)
- Make sure PostgreSQL is running: `brew services list | grep postgresql`

---

## 📝 Quick Reference Commands

### Start Everything (3 terminals)

**Terminal 1:**

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend && export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH" && npm run dev
```

**Terminal 2:**

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new && npm start
```

**Terminal 3:**

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend && npm run prisma:studio
```

### Stop Everything

```bash
# Stop backend (Ctrl+C in Terminal 1)
# Stop frontend (Ctrl+C in Terminal 2)
# Stop Prisma Studio (Ctrl+C in Terminal 3)

# Or kill all at once
pkill -f "tsx watch"
pkill -f "expo start"
pkill -f "prisma studio"
```

---

## ✅ Your Understanding is Correct!

You got it right! Here's the corrected and simplified version:

---

## 📋 Step-by-Step (3 Terminals)

### **Terminal 1: Backend** ✅

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
npm run dev
```

**Wait for:** `🚀 Server running on port 3000`

**Keep this terminal open!**

---

### **Terminal 2: Frontend** ✅

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/orbit-new
npm start
```

**Then:**

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web Browser
- Or scan QR code with Expo Go app

**Keep this terminal open!**

---

### **Terminal 3: Prisma Studio** ✅

```bash
cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
npm run prisma:studio
```

**Browser opens automatically** at `http://localhost:5555`

**Keep this terminal open!**

---

## 🎯 Step 4: Create Profile

1. **In your app** (from Terminal 2):

   - Enter phone number
   - Enter name
   - Enter pronouns (optional)
   - Enter bio (optional)
   - Click "Complete Profile"

2. **Check Prisma Studio** (Terminal 3):
   - Click on "User" table
   - **You should see your new user!** ✅
   - It updates in real-time!

---

## ❓ About Postman

### **Postman is NOT needed!** ✅

**Postman is optional** - it's just a tool to test the API directly without using the app.

### When to Use Postman:

- ✅ Testing API endpoints manually
- ✅ Debugging backend issues
- ✅ Learning how the API works

### When NOT to Use Postman:

- ❌ **You don't need it to run the app**
- ❌ **You don't need it to create profiles**
- ❌ **You don't need it for normal usage**

**You can ignore Postman completely if you want!** The app works fine without it.

---

## ✅ Complete Checklist

- [ ] Terminal 1: Backend running
- [ ] Terminal 2: Frontend running (app open)
- [ ] Terminal 3: Prisma Studio open
- [ ] Created a profile in app
- [ ] Profile appears in Prisma Studio

**That's it!** 🎉

---

## 🐛 Quick Troubleshooting

### Backend won't start?

```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Start if needed
brew services start postgresql@15
```

### Frontend can't connect?

- Make sure backend is running (Terminal 1)
- If using physical device, update IP in `services/api.js`

### Prisma Studio shows error?

```bash
# Kill and restart
pkill -f "prisma studio"
cd Orbit/backend
npm run prisma:studio
```

---

## 📝 Summary

**You need 3 terminals:**

1. Backend (`npm run dev`)
2. Frontend (`npm start`)
3. Prisma Studio (`npm run prisma:studio`)

**That's all!** Postman is optional and not needed for normal usage.

---

## 🎉 You're All Set!

Your understanding is correct! Just follow those 3 terminals and you're good to go! 🚀
