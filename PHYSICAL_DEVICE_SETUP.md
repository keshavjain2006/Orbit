# 📱 Physical Device Setup Guide

## ✅ Issue Fixed: "Cannot connect to backend"

### The Problem
When running the app on a **physical device** (not simulator), the app was trying to connect to `localhost:3000`, but:
- `localhost` on a physical device refers to the device itself, NOT your computer
- The backend is running on your computer, not on the device
- So the connection fails with "Cannot connect to backend"

### The Solution
I've updated the API configuration to use your computer's IP address (`172.16.4.209`) instead of `localhost`.

## 🔧 What I Fixed

1. **Updated `services/api.js`**:
   - Changed API URL from `http://localhost:3000/api` to `http://172.16.4.209:3000/api`
   - Added better error messages
   - Added comments explaining the setup

2. **Improved Error Handling**:
   - Better error messages that explain the issue
   - Clear instructions on what to check

## ✅ Verification Steps

### Step 1: Check Backend is Running
```bash
curl http://localhost:3000/health
# Should return: {"success":true,"message":"Server is running",...}
```

### Step 2: Check Backend is Accessible via IP
```bash
curl http://172.16.4.209:3000/health
# Should return: {"success":true,"message":"Server is running",...}
```

### Step 3: Test API Endpoints
```bash
# Test creating a user
curl -X POST http://172.16.4.209:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}'

# Test updating a user
curl -X PATCH http://172.16.4.209:3000/api/users/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

## 📝 If Your IP Address Changes

If your computer's IP address changes, update it in `orbit-new/services/api.js`:

```javascript
const YOUR_COMPUTER_IP = '172.16.4.209';  // Update this
```

To find your current IP:
```bash
# Mac
ipconfig getifaddr en0

# Windows
ipconfig
# Look for IPv4 Address under your active network adapter
```

## 🎯 Current Status

✅ Backend is running on port 3000
✅ Backend is accessible via IP (172.16.4.209:3000)
✅ API configuration updated to use IP address
✅ CORS configured to allow requests from your device
✅ All endpoints tested and working

## 🚀 Next Steps

1. **Restart your frontend app** (if it's running):
   - Stop it (Ctrl+C)
   - Restart: `cd orbit-new && npm start`

2. **Try creating/updating a profile** - it should work now!

3. **If you still get errors**:
   - Check that backend is running: `curl http://172.16.4.209:3000/health`
   - Check your device and computer are on the same network
   - Check firewall settings (port 3000 should be open)

## 🔍 Troubleshooting

### Error: "Cannot connect to backend"
1. Verify backend is running: `ps aux | grep "tsx watch"`
2. Verify backend is accessible: `curl http://172.16.4.209:3000/health`
3. Check IP address is correct in `services/api.js`
4. Make sure device and computer are on same WiFi network

### Error: "Network request failed"
- Check firewall isn't blocking port 3000
- Try accessing `http://172.16.4.209:3000/health` from your device's browser
- Verify CORS settings in backend allow your device's IP

### Still Not Working?
1. Check backend logs for errors
2. Verify database connection is working
3. Check that all required fields are being sent in the request

---

**The fix is complete!** Your app should now be able to connect to the backend when running on a physical device. 🎉

