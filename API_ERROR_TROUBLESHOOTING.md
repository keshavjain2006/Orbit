# 🔧 API Error Troubleshooting Guide

## Common API Errors and Fixes

### Error 1: "Cannot connect to backend" or "Failed to fetch"

**Cause:** Backend server is not running or wrong API URL

**Fix:**
1. Make sure backend is running:
   ```bash
   cd /Users/keshavjain/Desktop/Madhacks2025/Orbit/backend
   npm run dev
   ```
2. Check API URL in `services/api.js`:
   - For simulator/emulator: `http://localhost:3000/api` ✅ (default)
   - For physical device: `http://YOUR_IP:3000/api` (update IP)

### Error 2: "Network request failed" or CORS error

**Cause:** CORS configuration or network issue

**Fix:**
1. Check backend CORS settings in `backend/src/app.ts`
2. Make sure backend is running on port 3000
3. For physical device, update IP in `services/api.js`

### Error 3: "User postgres was denied access"

**Cause:** Database connection issue (already fixed, but if it persists)

**Fix:**
1. Check `.env` file has correct DATABASE_URL:
   ```bash
   cd backend
   cat .env | grep DATABASE_URL
   ```
   Should show: `DATABASE_URL="postgresql://keshavjain@localhost:5432/proximity_app?schema=public"`
2. Restart backend server

### Error 4: "404 Not Found" or "Route not found"

**Cause:** Wrong endpoint URL

**Fix:**
- Check endpoint exists in backend routes
- Verify API base URL is correct

### Error 5: "400 Bad Request" or validation error

**Cause:** Missing or invalid request data

**Fix:**
- Check console logs for what data is being sent
- Verify user IDs are valid UUIDs
- Check request body format matches API expectations

## Quick Diagnostic Steps

### Step 1: Check Backend is Running
```bash
curl http://localhost:3000/health
```
Should return: `{"success":true,"message":"Server is running",...}`

### Step 2: Test API Endpoints
```bash
# Test encounter endpoint
curl -X POST http://localhost:3000/api/encounters \
  -H "Content-Type: application/json" \
  -d '{"user1Id":"f16abb0e-6b70-42ec-96f6-d53d99fdde8b","user2Id":"11111111-1111-1111-1111-111111111111"}'

# Test connection requests endpoint
curl -X POST http://localhost:3000/api/connections/create-requests \
  -H "Content-Type: application/json"
```

### Step 3: Check Frontend API URL
Open `orbit-new/services/api.js` and verify:
```javascript
return 'http://localhost:3000/api';  // For simulator
// or
return 'http://172.16.4.209:3000/api';  // For physical device (update IP)
```

### Step 4: Check Console Logs
In your frontend terminal, look for:
- `🌐 API Request:` - Shows the URL being called
- `📥 API Response Status:` - Shows HTTP status
- `❌ API Error Response:` - Shows the actual error

## What I Just Fixed

✅ Changed API URL to default to `localhost` (works for simulators)
✅ Simplified API URL configuration
✅ Added better error handling

## Still Having Issues?

**Please share:**
1. The exact error message from your frontend terminal
2. What action you were trying to perform (e.g., "waving at Alex Morgan")
3. The console output showing the API request/response

This will help me diagnose the specific issue!

