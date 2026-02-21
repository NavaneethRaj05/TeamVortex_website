# CI/CD Pipeline - Quick Start Guide

## ⚡ 5-Minute Setup

### 1️⃣ Get Netlify Credentials (2 minutes)

**Site ID:**
1. Go to https://app.netlify.com/
2. Select your site
3. Settings → General → Site details
4. Copy **Site ID**

**Auth Token:**
1. Go to https://app.netlify.com/user/applications
2. Click "New access token"
3. Name it "GitHub Actions"
4. Copy the token

### 2️⃣ Add to GitHub (2 minutes)

1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add two secrets:
   - `NETLIFY_SITE_ID` = your site ID
   - `NETLIFY_AUTH_TOKEN` = your token

### 3️⃣ Push Code (1 minute)

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

### 4️⃣ Done! ✅

Go to your repo → Actions tab to see the pipeline running!

---

## 🎯 What You Get

✅ **Automatic Testing** on every push
✅ **Security Checks** for vulnerabilities  
✅ **Performance Testing** with Lighthouse
✅ **Auto Deployment** to Netlify
✅ **Preview Deployments** for PRs
✅ **Build Status** badges

---

## 🚀 Daily Workflow

### Making Changes:

```bash
# 1. Create a branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/my-feature

# 4. Create Pull Request on GitHub
# 5. Wait for automated checks ✅
# 6. Review preview deployment 🚀
# 7. Merge when ready!
```

---

## 📊 Monitoring

### Check Pipeline Status:
- GitHub repo → **Actions** tab
- See all runs and their status
- Click any run for detailed logs

### Check Deployments:
- Netlify dashboard
- See deployment history
- View Lighthouse scores

---

## 🛠️ Useful Commands

```bash
# Run tests locally
npm test

# Build locally
npm run build

# Check formatting
npm run format:check

# Fix formatting
npm run format

# Run linting
npm run lint

# Security audit
npm audit
```

---

## 🎨 Add Build Badge to README

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your details.

---

## 🚨 Common Issues

**Pipeline fails?**
- Check Actions tab for error details
- Run `npm run build` locally first
- Ensure all tests pass: `npm test`

**Deployment fails?**
- Verify secrets are correct
- Check Netlify dashboard
- Ensure build command works locally

**Tests fail?**
- Run `npm test` locally
- Fix failing tests
- Push again

---

## 📈 Success Metrics

Your pipeline is working when you see:
- ✅ Green checkmarks on commits
- 🚀 Automatic deployments
- 📊 Lighthouse scores
- 💬 Automated PR comments

---

## 🎓 Pro Tips

1. **Always use Pull Requests** - Don't push directly to main
2. **Review CI results** before merging
3. **Fix failing tests** immediately
4. **Monitor Lighthouse scores** - Keep them high!
5. **Update dependencies** regularly

---

## 📚 Full Documentation

See `CI_CD_SETUP_GUIDE.md` for complete details.

---

**That's it! Your CI/CD pipeline is ready! 🎉**

Every push now triggers automated testing, quality checks, and deployment!
