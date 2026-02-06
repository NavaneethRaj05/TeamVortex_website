# 🚀 Team Vortex Website - Replit Deployment Guide

## Overview
Deploy the Team Vortex website to Replit with automatic past events detection, MongoDB integration, and full-stack hosting in one place. Replit is simpler than Netlify because it handles both frontend and backend together!

---

## 📋 **Prerequisites**

### 1. Accounts Needed:
- ⬜ Replit account (free tier) - [Sign up here](https://replit.com/signup)
- ⬜ MongoDB Atlas account (free tier) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- ⬜ Gmail account for email service

### 2. Environment Variables Required:
```env
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=production
PORT=3000
```

---

## 🗄️ **Step 1: Set Up MongoDB Atlas (Database)**

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google or email
3. Choose **FREE** tier (M0 Sandbox)

### 1.2 Create a Cluster
1. Click **"Build a Database"**
2. Choose **FREE** tier (Shared)
3. Select a cloud provider (AWS recommended)
4. Choose a region closest to your users
5. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.3 Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `teamvortex`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### 1.4 Whitelist IP Addresses
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://teamvortex:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: 
   ```
   mongodb+srv://teamvortex:yourpassword@cluster0.xxxxx.mongodb.net/teamvortex?retryWrites=true&w=majority
   ```

---

## 📧 **Step 2: Set Up Email Service (Gmail)**

### 2.1 Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### 2.2 Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter: "Team Vortex Website"
5. Click **Generate**
6. Copy the 16-character password (save it!)

---

## 🌐 **Step 3: Deploy to Replit**

### 3.1 Create Replit Account
1. Go to [Replit](https://replit.com/signup)
2. Sign up with **GitHub** (recommended) or email
3. Verify your email

### 3.2 Import Your Project from GitHub

#### Option A: Import from GitHub (Recommended)
1. Click **"+ Create Repl"** button
2. Select **"Import from GitHub"** tab
3. Paste your repository URL:
   ```
   https://github.com/NavaneethRaj05/TeamVortex_website.git
   ```
   OR
   ```
   https://github.com/teamvortexnce/website.git
   ```
4. Click **"Import from GitHub"**
5. Replit will automatically detect it's a Node.js project
6. Click **"Done"**

#### Option B: Upload Files Manually
1. Click **"+ Create Repl"**
2. Select **"Node.js"** template
3. Name it: `teamvortex-website`
4. Click **"Create Repl"**
5. Upload all your project files using the file explorer

### 3.3 Configure Replit for Full-Stack App

#### 3.3.1 Create `.replit` Configuration File
1. In the Replit file explorer, create a new file: `.replit`
2. Add this configuration:

```toml
run = "npm run replit"
entrypoint = "server/server.js"

[nix]
channel = "stable-22_11"

[deployment]
run = ["sh", "-c", "npm run replit"]
deploymentTarget = "cloudrun"

[env]
NODE_ENV = "production"
```

#### 3.3.2 Update `package.json` Scripts
1. Open `package.json` in the root directory
2. Add these scripts to the `"scripts"` section:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "server": "cd server && node server.js",
    "replit": "npm run build && cd server && node server.js"
  }
}
```

#### 3.3.3 Update Server to Serve React Build
1. Open `server/server.js`
2. Add these lines after your existing routes (before `app.listen`):

```javascript
// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Handle React routing - return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}
```

### 3.4 Add Environment Variables (Secrets)

1. In your Repl, click on the **"Tools"** icon (🔧) in the left sidebar
2. Click **"Secrets"** (or look for the lock icon 🔒)
3. Add these secrets one by one:

| Key | Value | Example |
|-----|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://teamvortex:pass@cluster0.xxxxx.mongodb.net/teamvortex` |
| `EMAIL_USER` | Your Gmail address | `teamvortexnce@gmail.com` |
| `EMAIL_PASS` | Your Gmail app password | `abcd efgh ijkl mnop` |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `3000` | `3000` |

**Important:** Click **"Add new secret"** for each variable!

### 3.5 Install Dependencies

1. Open the **Shell** tab in Replit (bottom panel)
2. Run these commands:

```bash
# Install root dependencies (React)
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3.6 Build and Run

1. Click the **"Run"** button at the top
2. Replit will:
   - Build your React app (`npm run build`)
   - Start the Express server
   - Serve both frontend and backend

3. Wait 2-3 minutes for the build to complete
4. Your app will be live at: `https://teamvortex-website.your-username.repl.co`

---

## 🔧 **Step 4: Configure Server for Replit**

### 4.1 Update Server Port Configuration

Open `server/server.js` and ensure the port configuration looks like this:

```javascript
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

The `'0.0.0.0'` is important for Replit to expose the server properly.

### 4.2 Update API Configuration

Open `src/apiConfig.js` and update it:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string means same domain in production
  : 'http://localhost:5000';

export default API_BASE_URL;
```

This ensures API calls work correctly in Replit's environment.

---

## ✅ **Step 5: Verify Deployment**

### 5.1 Check Website
1. Visit your Replit URL (shown in the webview)
2. Test these features:
   - ✅ Home page loads
   - ✅ Events gallery shows PRAYOG 1.0
   - ✅ Past events appear automatically
   - ✅ Navigation works
   - ✅ Responsive design on mobile

### 5.2 Check API Functions
1. Open browser console (F12)
2. Go to Network tab
3. Navigate to Events page
4. Check API calls:
   - ✅ `/api/events/lightweight` returns data
   - ✅ `/api/events` returns data
   - ✅ No CORS errors

### 5.3 Test Event Registration
1. Try registering for an upcoming event
2. Check if email is sent
3. Verify data is saved in MongoDB

### 5.4 Check Server Logs
1. In Replit, open the **Console** tab
2. Look for:
   ```
   Server running on port 3000
   Environment: production
   MongoDB connected successfully
   ```

---

## 🎨 **Step 6: Keep Your Repl Always On (Optional)**

### Free Tier Limitations
- Repls sleep after 1 hour of inactivity
- They wake up when someone visits (takes 10-20 seconds)

### Option 1: Replit Hacker Plan ($7/month)
1. Upgrade to Hacker plan
2. Enable "Always On" for your Repl
3. Your site stays live 24/7

### Option 2: Use UptimeRobot (Free)
1. Sign up at [UptimeRobot](https://uptimerobot.com/)
2. Add a new monitor:
   - Type: HTTP(s)
   - URL: Your Replit URL
   - Interval: 5 minutes
3. UptimeRobot will ping your site every 5 minutes, keeping it awake

### Option 3: Cron Job (Free)
1. Use a free cron service like [cron-job.org](https://cron-job.org/)
2. Create a job that hits your Replit URL every 5 minutes
3. This keeps your Repl awake during active hours

---

## 🔄 **Step 7: Continuous Deployment**

### Automatic Updates from GitHub

1. In your Repl, click on the **Version Control** icon (Git branch icon)
2. Click **"Pull"** to get latest changes from GitHub
3. Click **"Run"** to rebuild and restart

### Manual Workflow:
```
1. Make changes locally
   ↓
2. Test locally: npm run dev
   ↓
3. Commit: git add . && git commit -m "message"
   ↓
4. Push to GitHub: git push origin main
   ↓
5. In Replit: Click "Pull" in Version Control
   ↓
6. Click "Run" to rebuild
   ↓
7. Verify changes on live site
```

---

## 🐛 **Troubleshooting Common Issues**

### Issue 1: Build Fails
**Error:** `npm ERR! code ELIFECYCLE`

**Solution:**
1. Check the Console for specific errors
2. Try clearing the build:
   ```bash
   rm -rf build node_modules
   npm install
   npm run build
   ```
3. Check Node version (Replit uses Node 16+)

### Issue 2: Server Won't Start
**Error:** `Error: listen EADDRINUSE`

**Solution:**
1. Stop the current process (click Stop button)
2. Clear any running processes:
   ```bash
   killall node
   ```
3. Click Run again

### Issue 3: MongoDB Connection Error
**Error:** `MongoServerError: bad auth`

**Solution:**
1. Verify MongoDB connection string in Secrets
2. Check IP whitelist (should be 0.0.0.0/0)
3. Test connection string format
4. Ensure password doesn't have special characters (or URL encode them)

### Issue 4: API 404 Errors
**Error:** `Cannot GET /api/events`

**Solution:**
1. Ensure server is running (check Console)
2. Verify `server/server.js` has all routes imported
3. Check that build folder exists: `ls -la build`
4. Restart the Repl

### Issue 5: Environment Variables Not Working
**Solution:**
1. Go to Tools → Secrets
2. Verify all secrets are added correctly
3. Restart the Repl (Stop and Run)
4. Check Console for loaded environment variables

### Issue 6: Repl Keeps Sleeping
**Solution:**
1. Use UptimeRobot to ping every 5 minutes (free)
2. Upgrade to Hacker plan for Always On
3. Use cron-job.org for scheduled pings

---

## 🎯 **Step 8: Performance Optimization**

### 8.1 Enable Caching
Already configured in `server/routes/events.js`:
```javascript
res.set('Cache-Control', 'public, max-age=300');
```

### 8.2 Optimize Build Size
1. In Replit Shell:
   ```bash
   npm run build
   ```
2. Check build size:
   ```bash
   du -sh build
   ```
3. Should be under 5MB for good performance

### 8.3 Monitor Performance
1. Use Chrome DevTools
2. Check Network tab for slow requests
3. Optimize images if needed

---

## 🔐 **Security Best Practices**

### 1. Environment Variables
- ✅ Never commit `.env` files to GitHub
- ✅ Use Replit Secrets for sensitive data
- ✅ Rotate passwords regularly

### 2. MongoDB Security
- ✅ Use strong passwords
- ✅ Enable MongoDB Atlas encryption
- ✅ Regular backups

### 3. API Security
- ✅ Rate limiting enabled (already configured)
- ✅ CORS configured properly
- ✅ Input validation on forms

---

## 📱 **Step 9: Custom Domain (Optional)**

### Using Replit Custom Domain (Hacker Plan Required)

1. Upgrade to Replit Hacker plan ($7/month)
2. Go to your Repl settings
3. Click **"Custom Domain"**
4. Enter your domain: `teamvortex.com`
5. Add these DNS records at your domain provider:

   **CNAME Record:**
   ```
   Type: CNAME
   Name: www
   Value: your-repl-name.your-username.repl.co
   ```

   **A Record (for root domain):**
   ```
   Type: A
   Name: @
   Value: (Replit will provide the IP)
   ```

6. Wait 24-48 hours for DNS propagation

---

## 📊 **Step 10: Monitor Your Deployment**

### 10.1 Replit Console
- View real-time server logs
- Check for errors and warnings
- Monitor API requests

### 10.2 MongoDB Atlas Monitoring
1. Go to **Metrics** tab in Atlas
2. Monitor:
   - Connection count
   - Database operations
   - Storage usage

### 10.3 Free Monitoring Tools
1. **Google Analytics:**
   - Add tracking code to `public/index.html`
   - Track user behavior

2. **UptimeRobot:**
   - Monitor uptime
   - Get alerts if site goes down

---

## 🎉 **Step 11: Seed Initial Data (Optional)**

If you want to populate your database with sample events:

1. In Replit Shell:
   ```bash
   cd server
   node seed.js
   ```

2. This will create:
   - Sample events
   - PRAYOG 1.0 with sub-events
   - Test registrations

---

## ✅ **Deployment Checklist**

Before going live, ensure:

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Gmail app password generated
- [ ] Replit account created
- [ ] Repository imported to Replit
- [ ] `.replit` configuration file created
- [ ] `package.json` scripts updated
- [ ] Server configured to serve React build
- [ ] All environment variables (Secrets) set in Replit
- [ ] Dependencies installed (root and server)
- [ ] Build successful (`npm run build`)
- [ ] Server starts without errors
- [ ] Website loads correctly
- [ ] API endpoints working
- [ ] Event registration tested
- [ ] Email notifications working
- [ ] Past events displaying automatically
- [ ] Admin dashboard accessible
- [ ] Mobile responsive
- [ ] UptimeRobot configured (to prevent sleeping)
- [ ] Performance optimized

---

## 🚀 **Quick Start Commands**

```bash
# Install all dependencies
npm install && cd server && npm install && cd ..

# Build React app
npm run build

# Start server (production mode)
cd server && node server.js

# Or use the Replit run command
npm run replit
```

---

## 📞 **Support & Resources**

### Documentation:
- [Replit Docs](https://docs.replit.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

### Community:
- [Replit Community](https://replit.com/talk)
- [MongoDB Community](https://www.mongodb.com/community/forums/)

### Team Vortex Support:
- Email: teamvortexnce@gmail.com
- GitHub Issues: [Create an issue](https://github.com/teamvortexnce/website/issues)

---

## 💡 **Pro Tips**

1. **Keep Repl Awake:** Use UptimeRobot (free) to ping every 5 minutes
2. **Fast Rebuilds:** Only rebuild when you change React code
3. **Debug Mode:** Set `NODE_ENV=development` temporarily to see detailed errors
4. **Database Backups:** MongoDB Atlas auto-backups on free tier
5. **Version Control:** Use Replit's built-in Git integration
6. **Collaboration:** Invite team members to your Repl for pair programming

---

## 🎯 **Advantages of Replit**

✅ **All-in-One:** Frontend + Backend in one place  
✅ **No Build Configuration:** Automatic detection  
✅ **Built-in IDE:** Code directly in browser  
✅ **Free Tier:** Generous free tier with 500MB RAM  
✅ **Instant Deploy:** Changes go live immediately  
✅ **Collaboration:** Real-time multiplayer coding  
✅ **Version Control:** Built-in Git integration  
✅ **Easy Debugging:** Console logs in real-time  

---

## 🎊 **Congratulations!**

Your Team Vortex website is now live on Replit with:
- ✅ Automatic past events detection
- ✅ Priority-based event display
- ✅ Full CRUD operations for admins
- ✅ Full-stack hosting (React + Express + MongoDB)
- ✅ Email notifications
- ✅ Real-time updates
- ✅ Free hosting (with optional Always On)
- ✅ Easy collaboration and updates

**Your site is production-ready! 🚀**

---

**Last Updated:** February 6, 2026  
**Version:** 1.0.0  
**Deployment Platform:** Replit + MongoDB Atlas  
**Estimated Setup Time:** 30-45 minutes
