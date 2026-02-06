# ✅ Replit Deployment Checklist

Follow this checklist step-by-step to deploy your Team Vortex website to Replit.

---

## 📋 Pre-Deployment Setup

### MongoDB Atlas (10 minutes)
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
- [ ] Create a FREE M0 cluster
- [ ] Create database user (username: `teamvortex`, strong password)
- [ ] Set IP whitelist to `0.0.0.0/0` (allow all)
- [ ] Get connection string
- [ ] Replace `<password>` in connection string
- [ ] Add database name to connection string: `/teamvortex`
- [ ] Test connection string format:
  ```
  mongodb+srv://teamvortex:yourpassword@cluster0.xxxxx.mongodb.net/teamvortex?retryWrites=true&w=majority
  ```

### Gmail App Password (5 minutes)
- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Generate app password for "Mail"
- [ ] Copy 16-character password (format: `xxxx xxxx xxxx xxxx`)
- [ ] Save password securely

---

## 🚀 Replit Deployment

### Step 1: Create Replit Account
- [ ] Go to https://replit.com/signup
- [ ] Sign up with GitHub (recommended) or email
- [ ] Verify email if required

### Step 2: Import Project
- [ ] Click **"+ Create Repl"** button
- [ ] Select **"Import from GitHub"** tab
- [ ] Paste repository URL:
  ```
  https://github.com/NavaneethRaj05/TeamVortex_website.git
  ```
- [ ] Click **"Import from GitHub"**
- [ ] Wait for import to complete
- [ ] Replit auto-detects Node.js project

### Step 3: Add Environment Variables (Secrets)
- [ ] Click **Tools** icon (🔧) in left sidebar
- [ ] Click **Secrets** (🔒)
- [ ] Add secret: `MONGODB_URI`
  - Value: Your MongoDB connection string
- [ ] Add secret: `EMAIL_USER`
  - Value: Your Gmail address (e.g., `teamvortexnce@gmail.com`)
- [ ] Add secret: `EMAIL_PASS`
  - Value: Your Gmail app password (16 characters)
- [ ] Add secret: `NODE_ENV`
  - Value: `production`
- [ ] Add secret: `PORT`
  - Value: `3000`
- [ ] Verify all 5 secrets are added

### Step 4: Install Dependencies
- [ ] Open **Shell** tab (bottom panel)
- [ ] Run: `npm install`
- [ ] Wait for root dependencies to install
- [ ] Run: `cd server && npm install`
- [ ] Wait for server dependencies to install
- [ ] Run: `cd ..` to return to root

### Step 5: Build and Deploy
- [ ] Click the **"Run"** button at the top
- [ ] Wait for build process (2-3 minutes)
- [ ] Watch Console for:
  ```
  🚀 Server running on port 3000
  📦 Environment: production
  ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
  ```
- [ ] Check for any errors in Console

### Step 6: Verify Deployment
- [ ] Open the webview (right panel)
- [ ] Check home page loads
- [ ] Navigate to Events page
- [ ] Check Events Gallery shows PRAYOG 1.0
- [ ] Verify past events display automatically
- [ ] Test navigation (Home, Events, Team, Sponsors)
- [ ] Check mobile responsiveness (resize browser)

---

## 🧪 Testing

### Frontend Tests
- [ ] Home page loads without errors
- [ ] Events Gallery section visible
- [ ] PRAYOG 1.0 featured at top
- [ ] Other past events displayed below
- [ ] Navigation menu works
- [ ] Footer displays correctly
- [ ] Mobile menu works (on small screens)

### Backend Tests
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Navigate to Events page
- [ ] Check API calls:
  - [ ] `/api/events/lightweight` returns 200
  - [ ] `/api/events` returns 200
  - [ ] No CORS errors
  - [ ] Response contains event data

### Database Tests
- [ ] Go to MongoDB Atlas dashboard
- [ ] Click **"Browse Collections"**
- [ ] Verify `teamvortex` database exists
- [ ] Check collections: `events`, `users`, `teammembers`, `sponsors`
- [ ] Verify data is present (or empty if fresh install)

### Email Tests (Optional)
- [ ] Try registering for an event
- [ ] Check if confirmation email is sent
- [ ] Verify email content is correct

---

## 🎯 Post-Deployment Setup

### Keep Repl Awake (Recommended)
- [ ] Sign up at https://uptimerobot.com/ (free)
- [ ] Add new monitor:
  - Type: HTTP(s)
  - URL: Your Replit URL
  - Interval: 5 minutes
- [ ] Verify monitor is active
- [ ] Your Repl will stay awake!

### Seed Initial Data (Optional)
- [ ] In Replit Shell, run: `cd server`
- [ ] Run: `node seed.js`
- [ ] This creates sample events and data
- [ ] Verify data appears on website

### Admin Access
- [ ] Navigate to `/signin` on your site
- [ ] Create admin account or use existing credentials
- [ ] Access admin dashboard at `/dashboard`
- [ ] Test CRUD operations:
  - [ ] Create new event
  - [ ] Edit existing event
  - [ ] Delete event
  - [ ] Manage team members
  - [ ] Manage sponsors

---

## 🔧 Troubleshooting

### Build Fails
- [ ] Check Console for specific error
- [ ] Try: `rm -rf build node_modules`
- [ ] Run: `npm install`
- [ ] Run: `npm run build`
- [ ] Click Run again

### Server Won't Start
- [ ] Stop current process (Stop button)
- [ ] Run: `killall node`
- [ ] Click Run again
- [ ] Check Secrets are set correctly

### MongoDB Connection Error
- [ ] Verify connection string in Secrets
- [ ] Check password has no special characters
- [ ] Verify IP whitelist is 0.0.0.0/0
- [ ] Test connection string in MongoDB Compass

### API 404 Errors
- [ ] Verify server is running (check Console)
- [ ] Check `build` folder exists: `ls -la build`
- [ ] Restart Repl (Stop and Run)
- [ ] Clear browser cache

### Environment Variables Not Working
- [ ] Go to Tools → Secrets
- [ ] Verify all 5 secrets are present
- [ ] Check for typos in secret names
- [ ] Restart Repl
- [ ] Check Console for loaded variables

---

## 📊 Performance Checks

### Load Time
- [ ] Home page loads in < 3 seconds
- [ ] Events page loads in < 2 seconds
- [ ] Images load properly
- [ ] No console errors

### API Performance
- [ ] API responses in < 500ms
- [ ] No timeout errors
- [ ] Caching headers present

### Mobile Performance
- [ ] Test on mobile device or DevTools mobile view
- [ ] Navigation works smoothly
- [ ] Images are responsive
- [ ] Forms are usable

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Website loads at your Replit URL
- ✅ Home page displays correctly
- ✅ Events Gallery shows PRAYOG 1.0
- ✅ Past events appear automatically
- ✅ Navigation works on all pages
- ✅ API endpoints return data
- ✅ MongoDB connection is stable
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Admin dashboard accessible

---

## 📝 Notes

**Your Replit URL format:**
```
https://teamvortex-website.your-username.repl.co
```

**Important Files:**
- `.replit` - Replit configuration (already created)
- `package.json` - Contains `replit` script
- `server/server.js` - Serves React build in production
- `src/apiConfig.js` - API configuration

**Useful Commands:**
```bash
# Build React app
npm run build

# Start server
npm run replit

# Install dependencies
npm install && cd server && npm install

# Clear and rebuild
rm -rf build && npm run build
```

---

## 🆘 Need Help?

- 📖 **Full Guide:** `REPLIT_DEPLOYMENT_GUIDE.md`
- 🚀 **Quick Start:** `REPLIT_QUICK_START.md`
- 📧 **Email:** teamvortexnce@gmail.com
- 🐛 **GitHub Issues:** https://github.com/NavaneethRaj05/TeamVortex_website/issues

---

**Estimated Total Time:** 30-45 minutes  
**Difficulty:** Easy  
**Cost:** FREE (with optional $7/month for Always On)

**Last Updated:** February 6, 2026
