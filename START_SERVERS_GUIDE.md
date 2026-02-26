# How to Start Team Vortex Application

## The "Failed to fetch" Error

This error means the **backend server is not running**. Both frontend and backend need to be running simultaneously.

---

## Quick Start (3 Steps)

### Step 1: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud)** - No local installation needed!

---

### Step 2: Start Backend Server

Open a **NEW terminal** and run:

```bash
cd server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5001
```

**Keep this terminal running!**

---

### Step 3: Start Frontend

In **another terminal**, run:

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## Now Try Signing In Again

1. Go to http://localhost:3000/signin
2. Enter credentials
3. The "Failed to fetch" error should be gone!

---

## Default Admin Credentials

If you need to create an admin user, use the seed script:

```bash
cd server
node seed.js
```

This creates:
- **Email:** admin@teamvortex.com
- **Password:** admin123

---

## Troubleshooting

### Issue 1: "Port 5001 already in use"

**Windows:**
```bash
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:5001 | xargs kill -9
```

### Issue 2: "MongoDB connection failed"

**Option A: Install MongoDB locally**
- Windows: https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`

**Option B: Use MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teamvortex
```

### Issue 3: "Cannot find module"

```bash
# In server directory
cd server
npm install

# In root directory
cd ..
npm install
```

### Issue 4: Still getting "Failed to fetch"

1. Check if backend is running: http://localhost:5001/api/health
2. Check browser console (F12) for detailed errors
3. Verify `src/apiConfig.js` has correct URL:
   ```javascript
   const API_BASE_URL = isLocal ? 'http://localhost:5001' : 'production-url';
   ```

---

## Development Workflow

### Terminal 1 - Backend:
```bash
cd server
npm start
# Keep running
```

### Terminal 2 - Frontend:
```bash
npm start
# Keep running
```

### Terminal 3 - MongoDB (if local):
```bash
mongod
# Keep running
```

---

## Verification Checklist

Before using the application:

- [ ] MongoDB is running (check with `mongosh` or MongoDB Compass)
- [ ] Backend server shows "Server running on port 5001"
- [ ] Backend server shows "MongoDB connected"
- [ ] Frontend shows "Compiled successfully"
- [ ] Can access http://localhost:5001/api/health
- [ ] Can access http://localhost:3000
- [ ] No errors in browser console (F12)

---

## Quick Test Commands

### Test Backend:
```bash
curl http://localhost:5001/api/health
# Should return: {"status":"ok"}
```

### Test MongoDB:
```bash
mongosh
# Should connect to MongoDB shell
```

### Test Frontend:
Open browser to http://localhost:3000
- Should see Team Vortex homepage
- No console errors

---

## Production Deployment

### Backend (Heroku/Railway/Render):
1. Deploy backend code
2. Set environment variables:
   ```
   MONGODB_URI=your-mongodb-atlas-uri
   PORT=5001
   NODE_ENV=production
   ```
3. Note the deployed URL

### Frontend (Netlify/Vercel):
1. Update `src/apiConfig.js`:
   ```javascript
   const API_BASE_URL = isLocal 
     ? 'http://localhost:5001' 
     : 'https://your-backend-url.com';
   ```
2. Build: `npm run build`
3. Deploy `build` folder

---

## Common Mistakes

❌ **Only starting frontend** → Backend needed too!
❌ **Wrong terminal directory** → Must be in correct folder
❌ **MongoDB not running** → Start MongoDB first
❌ **Closing terminal** → Keep terminals open while developing
❌ **Wrong port** → Backend must be on 5001, frontend on 3000

✅ **Correct Setup:**
- 3 terminals running simultaneously
- MongoDB → Backend → Frontend
- All showing "running" or "compiled successfully"

---

## Need Help?

### Check These First:
1. **Backend Terminal:** Any error messages?
2. **Browser Console (F12):** Any red errors?
3. **Network Tab (F12):** Failed requests?
4. **MongoDB:** Is it running?

### Still Stuck?
- Email: teamvortexnce@gmail.com
- Include: Screenshots of error messages and terminal outputs

---

## Success Indicators

✅ Backend terminal: "Server running on port 5001"
✅ Backend terminal: "MongoDB connected"
✅ Frontend terminal: "Compiled successfully"
✅ Browser: No console errors
✅ Sign in page: No "Failed to fetch" error
✅ Can navigate to dashboard after login

---

## Auto-Start Script (Optional)

Create `start-all.sh` (Mac/Linux):

```bash
#!/bin/bash
echo "Starting MongoDB..."
brew services start mongodb-community

echo "Starting Backend..."
cd server
npm start &
BACKEND_PID=$!

echo "Starting Frontend..."
cd ..
npm start &
FRONTEND_PID=$!

echo "All services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all services"

wait
```

Make executable:
```bash
chmod +x start-all.sh
./start-all.sh
```

---

## Summary

**The Fix:** Start the backend server!

```bash
# Terminal 1
cd server
npm start

# Terminal 2  
npm start
```

That's it! The "Failed to fetch" error will disappear once the backend is running.
