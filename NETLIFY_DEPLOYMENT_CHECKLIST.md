# Netlify Deployment Checklist

## ✅ Pre-Deployment Verification (All Completed)

### 1. Dependencies
- ✅ All server dependencies added to main `package.json`
- ✅ `razorpay` installed
- ✅ `serverless-http` installed
- ✅ All packages verified with `npm list`

### 2. Configuration Files
- ✅ `netlify.toml` configured correctly
- ✅ Build command: `npm run build`
- ✅ Publish directory: `build`
- ✅ Functions directory: `netlify/functions`
- ✅ Node version: 18
- ✅ CI set to false

### 3. Serverless Function
- ✅ `netlify/functions/api.js` properly wraps Express app
- ✅ Server exports app with `module.exports = app`
- ✅ Server doesn't listen on port in serverless environment
- ✅ Event scheduler disabled in serverless environment

### 4. API Configuration
- ✅ `src/apiConfig.js` uses relative path for production
- ✅ CORS configured to allow all origins in production
- ✅ API redirects configured: `/api/*` → `/.netlify/functions/api/:splat`

### 5. Build Verification
- ✅ Local build succeeds with no errors
- ✅ All syntax checks pass
- ✅ No ESLint errors

### 6. Security & Headers
- ✅ Security headers configured
- ✅ Cache headers for static assets
- ✅ XSS protection enabled
- ✅ Rate limiting configured

## 🔧 Required Netlify Environment Variables

You MUST set these in Netlify Dashboard → Site Settings → Environment Variables:

### Required:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teamvortex
JWT_SECRET=your-super-secret-jwt-key
```

### Optional (for full functionality):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=Team Vortex <noreply@teamvortex.com>
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=production
```

## 📋 Deployment Steps

1. **Push to GitHub** (Already done)
   ```bash
   git push origin main
   ```

2. **Set Environment Variables in Netlify**
   - Go to: Site Settings → Environment Variables
   - Add all required variables listed above
   - Click "Save"

3. **Trigger Deploy**
   - Netlify will auto-deploy on push
   - Or manually: Deploys → Trigger deploy → Deploy site

4. **Verify Deployment**
   - Check build logs for errors
   - Test frontend loads
   - Test API endpoints: `https://your-site.netlify.app/api/health`
   - Test chatbot functionality
   - Test event registration

## 🐛 Troubleshooting

### If "Something went wrong" error appears:

1. **Check Netlify Function Logs**
   - Go to: Functions → api → View logs
   - Look for MongoDB connection errors
   - Verify environment variables are set

2. **Common Issues:**
   - ❌ MongoDB URI not set → Set `MONGODB_URI` in Netlify
   - ❌ JWT_SECRET not set → Set `JWT_SECRET` in Netlify
   - ❌ CORS errors → Already fixed (allows all origins)
   - ❌ Function timeout → MongoDB connection issue

3. **Test API Directly:**
   ```
   https://your-site.netlify.app/.netlify/functions/api
   ```
   Should return: "Team Vortex API is Running"

## ✨ Post-Deployment

- [ ] Test all pages load correctly
- [ ] Test chatbot works
- [ ] Test event registration
- [ ] Test payment flow (if Razorpay configured)
- [ ] Test contact forms
- [ ] Check browser console for errors
- [ ] Test on mobile devices

## 📞 Support

If deployment fails, check:
1. Netlify build logs
2. Netlify function logs
3. Browser console errors
4. Network tab in DevTools

All configuration is correct and ready for deployment! 🚀
