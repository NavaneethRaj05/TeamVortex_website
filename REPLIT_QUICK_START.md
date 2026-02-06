# 🚀 Replit Quick Start Guide

## 5-Minute Setup

### Step 1: Import to Replit
1. Go to [Replit](https://replit.com)
2. Click **"+ Create Repl"**
3. Select **"Import from GitHub"**
4. Paste: `https://github.com/NavaneethRaj05/TeamVortex_website.git`
5. Click **"Import from GitHub"**

### Step 2: Add Secrets (Environment Variables)
1. Click **Tools** (🔧) → **Secrets** (🔒)
2. Add these secrets:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/teamvortex
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-gmail-app-password
NODE_ENV = production
PORT = 3000
```

### Step 3: Install Dependencies
In the Shell tab, run:
```bash
npm install && cd server && npm install && cd ..
```

### Step 4: Run!
Click the **"Run"** button at the top.

Wait 2-3 minutes for the build to complete.

Your site will be live! 🎉

---

## MongoDB Setup (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a **FREE** cluster
3. Create a database user
4. Whitelist IP: **0.0.0.0/0** (allow all)
5. Get connection string and add to Replit Secrets

**Detailed guide:** See `REPLIT_DEPLOYMENT_GUIDE.md`

---

## Gmail Setup (2 minutes)

1. Enable 2FA on your Gmail account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate app password for "Mail"
4. Add to Replit Secrets as `EMAIL_PASS`

---

## Keep Your Repl Awake (Free)

Use [UptimeRobot](https://uptimerobot.com/):
1. Sign up (free)
2. Add HTTP monitor with your Replit URL
3. Set interval to 5 minutes
4. Your site stays awake! ⏰

---

## Troubleshooting

### Build fails?
```bash
rm -rf build node_modules
npm install
npm run build
```

### Server won't start?
```bash
killall node
```
Then click Run again.

### MongoDB connection error?
- Check connection string in Secrets
- Verify IP whitelist is 0.0.0.0/0
- Ensure password has no special characters

---

## File Structure

```
.
├── .replit              # Replit configuration (already created)
├── package.json         # Root dependencies + replit script
├── src/                 # React frontend
│   ├── pages/
│   ├── components/
│   └── apiConfig.js     # API configuration
├── server/              # Express backend
│   ├── server.js        # Main server file
│   ├── routes/          # API routes
│   └── models/          # MongoDB models
└── build/               # React production build (auto-generated)
```

---

## Commands

```bash
# Build React app
npm run build

# Start server (production)
npm run replit

# Install all dependencies
npm install && cd server && npm install

# Clear and rebuild
rm -rf build && npm run build
```

---

## What Happens When You Click "Run"?

1. ✅ Builds React app (`npm run build`)
2. ✅ Starts Express server on port 3000
3. ✅ Server serves React build files
4. ✅ API endpoints available at `/api/*`
5. ✅ Your site is live!

---

## Features Included

✅ Automatic past events detection  
✅ Priority-based event display  
✅ Full CRUD operations for admins  
✅ Event registration with email notifications  
✅ Payment verification system  
✅ Team management  
✅ Sponsor management  
✅ Analytics dashboard  
✅ Mobile responsive design  

---

## Need Help?

📖 **Full Guide:** `REPLIT_DEPLOYMENT_GUIDE.md`  
📧 **Email:** teamvortexnce@gmail.com  
🐛 **Issues:** [GitHub Issues](https://github.com/NavaneethRaj05/TeamVortex_website/issues)

---

**Estimated Setup Time:** 15-20 minutes  
**Cost:** FREE (with optional $7/month for Always On)
