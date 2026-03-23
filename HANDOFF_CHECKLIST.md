# Deployment Handoff Checklist
## Africa Health Financing Gap Analysis Platform

**Version**: 1.0
**Date**: 2026-03-22
**Status**: Ready for Deployment
**Prepared For**: Deployment Team

---

## 📋 Executive Summary

This package contains a complete, production-ready web application for analyzing health financing gaps across Africa. The platform is built with **React 19** (frontend) and **Node.js/Express 5** (backend), covering 54 African countries from 2000-2023.

**Key Information**:
- **Data Source**: WHO Global Health Expenditure Database (GHED)
- **Coverage**: 54 African countries, 24 years (2000-2023)
- **Technology Stack**: React + TypeScript, Node.js + Express
- **Deployment Status**: ✅ Ready for production
- **Complementary Platform**: https://health-dashboard-winter-sky-9151.fly.dev/

---

## 📦 Package Contents

### Documentation Files

| File | Purpose | Priority |
|------|---------|----------|
| `DEPLOYMENT_GUIDE.md` | Step-by-step deployment instructions | 🔴 Critical |
| `ENVIRONMENT_CONFIG.md` | Environment variables reference | 🔴 Critical |
| `USER_GUIDE.md` | End-user platform navigation guide | 🟡 Important |
| `HANDOFF_CHECKLIST.md` | This file - deployment checklist | 🔴 Critical |
| `DATA_SOURCE_DOCUMENTATION.md` | Data provenance and processing | 🟢 Reference |
| `README.md` | Project overview | 🟡 Important |

### Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `backend/.env.example` | Backend environment template | ✅ Created |
| `frontend/health-financing-dashboard/.env.example` | Frontend dev template | ✅ Created |
| `frontend/health-financing-dashboard/.env.production.example` | Frontend production template | ✅ Created |
| `fly.toml` | Fly.io deployment config | ✅ Created |
| `Dockerfile` | Container build instructions | ✅ Created |
| `.dockerignore` | Docker build exclusions | ✅ Created |
| `nginx.conf.example` | Nginx configuration (VPS) | ✅ Created |

### Application Code

| Component | Location | Status |
|-----------|----------|--------|
| Frontend | `frontend/health-financing-dashboard/` | ✅ Complete |
| Backend | `backend/` | ✅ Complete |
| Data | `processed_data/` | ✅ Complete |
| Assets | `frontend/health-financing-dashboard/public/` | ✅ Complete |

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites Check

Before deployment, ensure you have:

```bash
✅ Node.js 16.x or higher installed
✅ npm 8.x or higher installed
✅ Git installed (if cloning from repository)
✅ Access to deployment platform (Fly.io, VPS, etc.)
✅ Text editor for configuring .env files
```

**Verify installations**:
```bash
node --version   # Should show v16.x or higher
npm --version    # Should show 8.x or higher
git --version    # Should show 2.x or higher
```

---

### Local Test Run (Recommended First Step)

Test the application locally before deploying to production:

#### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

Expected output: `added XX packages in XXs`

#### Step 2: Create Backend .env File
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
DATA_PATH=../processed_data
ENABLE_REQUEST_LOGGING=true
```

#### Step 3: Start Backend Server
```bash
npm start
```

Expected output:
```
================================
Health Financing Gap API Server
================================
Environment: development
Port: 5000
Data directory: /path/to/processed_data
Allowed origins: http://localhost:3000
API endpoints: http://localhost:5000/api/
================================
```

Test: Open http://localhost:5000/api/health in browser
Expected: `{"status":"OK","message":"Health Financing Gap API is running"}`

#### Step 4: Install Frontend Dependencies (New Terminal)
```bash
cd frontend/health-financing-dashboard
npm install
```

Expected: `added XXX packages in XXs` (takes 2-3 minutes)

#### Step 5: Start Frontend Development Server
```bash
npm start
```

Expected: Browser opens automatically to http://localhost:3000

**✅ Success Indicators**:
- Homepage loads with UN-ECA logo
- Navigation menu works
- Charts display properly
- Footer shows "© 2026 United Nations Economic Commission for Africa"

**If this works locally, you're ready for production deployment!**

---

## 🎯 Deployment Options

Choose ONE deployment option based on your infrastructure:

### Option 1: Fly.io (Recommended - Easiest)

**Why**: Simple, free tier available, already hosts complementary platform

**Time**: ~15 minutes

**Steps**: See `DEPLOYMENT_GUIDE.md` → Section "Option 1: Deploy to Fly.io"

**Quick Command Reference**:
```bash
# Install Fly CLI
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# Mac/Linux: curl -L https://fly.io/install.sh | sh

fly auth login
fly launch
fly deploy
fly open
```

---

### Option 2: VPS (Ubuntu/Debian Server)

**Why**: Full control, traditional infrastructure

**Time**: ~45 minutes

**Steps**: See `DEPLOYMENT_GUIDE.md` → Section "Option 3: Deploy to Traditional Server (VPS)"

**Requirements**:
- Ubuntu 20.04+ or Debian 11+
- Root/sudo access
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

**Key Tools**:
- PM2: Process manager for Node.js
- Nginx: Reverse proxy and static file server
- Certbot: SSL certificate management

---

### Option 3: Docker

**Why**: Containerized, portable, works anywhere

**Time**: ~20 minutes

**Steps**: See `DEPLOYMENT_GUIDE.md` → Section "Option 4: Docker Deployment"

**Quick Command**:
```bash
docker build -t health-financing-platform .
docker run -p 8080:8080 health-financing-platform
```

---

### Option 4: Vercel (Frontend Only)

**Why**: Easy frontend hosting, free tier

**Time**: ~10 minutes (frontend only, backend deployed separately)

**Steps**: See `DEPLOYMENT_GUIDE.md` → Section "Option 2: Deploy to Vercel"

**Note**: Requires separate backend deployment (Heroku, Railway, etc.)

---

## ⚙️ Environment Configuration

### Critical: Understanding Environment Variables

**Two separate .env files are needed**:

1. **Backend**: `backend/.env`
   - Loaded at **runtime**
   - Can be changed without rebuilding
   - Controls CORS, data path, logging

2. **Frontend**: `frontend/health-financing-dashboard/.env.production`
   - Embedded at **build time**
   - Requires rebuild if changed
   - Controls API URL

### Backend Environment Setup

**File**: `backend/.env`

**Required Variables**:
```env
PORT=5000                          # Or 8080 for Fly.io
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://health-dashboard-winter-sky-9151.fly.dev
DATA_PATH=../processed_data
```

**Optional But Recommended**:
```env
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
ENABLE_COMPRESSION=true
CACHE_MAX_AGE=3600
```

**⚠️ IMPORTANT**:
- Update `ALLOWED_ORIGINS` with your actual domain
- Include `https://health-dashboard-winter-sky-9151.fly.dev` for cross-platform linking
- Never use `ALLOWED_ORIGINS=*` in production

---

### Frontend Environment Setup

**File**: `frontend/health-financing-dashboard/.env.production`

**Required Variable**:
```env
REACT_APP_API_URL=/api
```

**API URL Options**:

| Scenario | Value |
|----------|-------|
| Same domain (Recommended) | `/api` |
| Separate backend domain | `https://api.yourdomain.com/api` |
| Fly.io (single app) | `/api` |
| Fly.io (separate apps) | `https://backend-app.fly.dev/api` |

**Optional Variables**:
```env
REACT_APP_ENV=production
REACT_APP_GA_ID=G-XXXXXXXXXX      # Google Analytics
```

**⚠️ CRITICAL**:
- All frontend environment variables MUST start with `REACT_APP_`
- After changing `.env.production`, you MUST rebuild: `npm run build`
- The built files in `build/` contain the embedded values

---

## 🔐 Security Checklist

Before going live, verify these security measures:

### SSL/HTTPS
- [ ] SSL certificate installed (Let's Encrypt recommended)
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured

### Environment Variables
- [ ] No `.env` files committed to Git (check `.gitignore`)
- [ ] Production `.env` files created and configured
- [ ] CORS properly configured (specific domains, not `*`)
- [ ] No secrets exposed in frontend (all secrets in backend)

### Headers & Configuration
- [ ] Security headers configured (see `nginx.conf.example`)
  - [ ] `X-Frame-Options: SAMEORIGIN`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Strict-Transport-Security` (HSTS)
- [ ] Gzip compression enabled
- [ ] Rate limiting configured (optional)

### Dependencies
- [ ] No critical vulnerabilities in npm packages
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] Dependencies updated to latest stable versions

### Firewall & Access
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH key authentication (disable password auth)
- [ ] Backend port (5000) NOT exposed publicly (only via Nginx)

### Backups
- [ ] Backup strategy in place for `processed_data/`
- [ ] Automated backups configured (daily recommended)

### Monitoring
- [ ] Health check endpoint accessible: `/api/health`
- [ ] Uptime monitoring configured
- [ ] Error logging configured

---

## 📊 Post-Deployment Verification

After deployment, verify these endpoints:

### Health Check
```bash
curl https://yourdomain.com/api/health
```
**Expected**:
```json
{"status":"OK","message":"Health Financing Gap API is running"}
```

### Frontend Loads
```bash
curl -I https://yourdomain.com
```
**Expected**:
```
HTTP/2 200
content-type: text/html
...
```

### API Data Endpoint
```bash
curl https://yourdomain.com/api/data/master | head -20
```
**Expected**: JSON array with health financing data

### CORS Working
```bash
curl -H "Origin: https://health-dashboard-winter-sky-9151.fly.dev" \
     -I https://yourdomain.com/api/health
```
**Expected**: `Access-Control-Allow-Origin` header in response

### SSL Certificate
Visit https://yourdomain.com in browser
**Expected**:
- 🔒 Padlock icon in address bar
- No SSL warnings
- Certificate valid and trusted

---

## 🌐 DNS Configuration

If deploying with a custom domain:

### Required DNS Records

```
A Record:     yourdomain.com → [Server IP Address]
CNAME Record: www.yourdomain.com → yourdomain.com
```

### For Fly.io

Fly.io provides automatic DNS:
```
Your app: health-financing-gap.fly.dev
```

Or configure custom domain:
```bash
fly certs add yourdomain.com
fly certs add www.yourdomain.com
```

Then add CNAME:
```
CNAME: yourdomain.com → health-financing-gap.fly.dev
CNAME: www.yourdomain.com → health-financing-gap.fly.dev
```

---

## 🔄 Build Process

### Frontend Build

**When**: Before deployment, after any code or env changes

**Command**:
```bash
cd frontend/health-financing-dashboard
npm run build
```

**Output Location**: `frontend/health-financing-dashboard/build/`

**Expected Output**:
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
  XX.XX kB  build/static/js/main.XXXXXXXX.js
  XX.XX kB  build/static/css/main.XXXXXXXX.css

The build folder is ready to be deployed.
```

**⚠️ Build Failures**:

If you see "JavaScript heap out of memory":
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Verify Build**:
```bash
ls -la build/
# Should see: index.html, static/, manifest.json, robots.txt
```

---

## 📱 Cross-Platform Integration

This platform works alongside the **Health Financing Dashboard**:

**Complementary Platform URL**: https://health-dashboard-winter-sky-9151.fly.dev/

**Integration Points**:
1. **Footer**: Links to complementary platform
2. **About page**: Describes relationship between platforms
3. **CORS**: Backend allows requests from dashboard URL

**Verify Integration**:
- [ ] Footer link to dashboard works
- [ ] About page mentions complementary platform
- [ ] Backend `ALLOWED_ORIGINS` includes dashboard URL:
  ```env
  ALLOWED_ORIGINS=https://yourdomain.com,https://health-dashboard-winter-sky-9151.fly.dev
  ```

---

## 🐛 Common Issues & Solutions

### Issue 1: Frontend Can't Connect to Backend

**Symptoms**:
- Charts don't load
- Console shows CORS errors or 404s
- "Cannot connect to API" message

**Solutions**:
1. Verify `REACT_APP_API_URL` in `.env.production` is correct
2. Rebuild frontend after changing env: `npm run build`
3. Check backend `ALLOWED_ORIGINS` includes frontend domain
4. Test backend health endpoint: `curl http://localhost:5000/api/health`

---

### Issue 2: Backend Won't Start

**Symptoms**:
- Server crashes on startup
- Port already in use
- Can't find data files

**Solutions**:
```bash
# Check if port 5000 is in use
lsof -ti:5000

# Kill process if needed
kill -9 $(lsof -ti:5000)

# Verify data path
ls -la ../processed_data/

# Check .env file exists
cat backend/.env

# View server logs
pm2 logs health-financing-api  # If using PM2
```

---

### Issue 3: Charts Not Rendering

**Symptoms**:
- Blank page where charts should be
- JavaScript errors in console

**Solutions**:
1. Open browser console (F12)
2. Check for errors in Console tab
3. Check Network tab for failed API calls
4. Verify data files exist:
   ```bash
   ls -la processed_data/
   ```
5. Test API endpoints directly:
   ```bash
   curl http://localhost:5000/api/indicators/public-health-financing
   ```

---

### Issue 4: SSL Certificate Issues

**Symptoms**:
- Browser shows "Not Secure"
- Certificate warnings

**Solutions**:
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

---

## 📞 Support Contacts

### Platform Technical Issues
**Contact**: UN-ECA Technical Team
**Website**: https://www.uneca.org
**Scope**: Deployment, platform bugs, feature requests

### Data Questions
**Contact**: WHO Global Health Expenditure Database
**Email**: healthaccounts@who.int
**Website**: https://apps.who.int/nha/database
**Scope**: Data accuracy, methodology, source data

### Complementary Platform
**URL**: https://health-dashboard-winter-sky-9151.fly.dev/
**Scope**: Real-time health financing dashboard

---

## 📝 Pre-Deployment Checklist

Print this section and check off each item before going live:

### Code & Configuration
- [ ] All code committed to Git (if using version control)
- [ ] `.gitignore` includes `.env` files
- [ ] Backend `.env` created with production values
- [ ] Frontend `.env.production` created with production API URL
- [ ] CORS `ALLOWED_ORIGINS` configured correctly
- [ ] Dependencies installed (`npm install` in both backend and frontend)
- [ ] Frontend built for production (`npm run build`)

### Security
- [ ] SSL certificate installed and working
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers configured
- [ ] No secrets in frontend .env (all are public)
- [ ] Firewall configured
- [ ] `npm audit` shows no critical vulnerabilities

### Deployment Platform
- [ ] Deployment platform chosen (Fly.io, VPS, Docker, etc.)
- [ ] Platform account created and accessible
- [ ] Domain name configured (if using custom domain)
- [ ] DNS records created and propagated

### Testing
- [ ] Local test successful (http://localhost:3000)
- [ ] Backend health check working (`/api/health`)
- [ ] Frontend loads properly
- [ ] Charts render correctly
- [ ] All navigation links work
- [ ] Cross-links to complementary platform work
- [ ] Download functionality tested

### Monitoring & Backup
- [ ] Health check endpoint accessible
- [ ] Uptime monitoring configured
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Log rotation configured (if using PM2/VPS)

### Documentation
- [ ] `DEPLOYMENT_GUIDE.md` reviewed
- [ ] `ENVIRONMENT_CONFIG.md` reviewed
- [ ] `USER_GUIDE.md` available for end users
- [ ] This checklist completed

---

## 🎉 Post-Deployment Tasks

### Immediately After Deployment

1. **Verify Deployment**
   - [ ] Visit production URL in browser
   - [ ] Check all major pages (Home, About, Charts, Explorer)
   - [ ] Test a few charts
   - [ ] Verify footer and cross-links

2. **Monitor for 24 Hours**
   - [ ] Check error logs
   - [ ] Monitor uptime
   - [ ] Watch for performance issues
   - [ ] Check SSL certificate status

3. **Announce Deployment**
   - [ ] Notify stakeholders of production URL
   - [ ] Share `USER_GUIDE.md` with end users
   - [ ] Update documentation with actual production URL

---

## 📚 Documentation Reference

| Document | Use When |
|----------|----------|
| `DEPLOYMENT_GUIDE.md` | Following deployment steps |
| `ENVIRONMENT_CONFIG.md` | Configuring .env files |
| `USER_GUIDE.md` | Training end users |
| `HANDOFF_CHECKLIST.md` | Pre-deployment verification |
| `DATA_SOURCE_DOCUMENTATION.md` | Understanding data provenance |

---

## 🔄 Updates & Maintenance

### Updating the Platform

When you need to update the platform:

1. **Backup current version**
   ```bash
   tar -czf backup-$(date +%Y%m%d).tar.gz health-financing-platform/
   ```

2. **Pull updates** (if using Git)
   ```bash
   git pull origin main
   ```

3. **Update dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend/health-financing-dashboard && npm install
   ```

4. **Rebuild frontend**
   ```bash
   npm run build
   ```

5. **Restart backend**
   ```bash
   pm2 restart health-financing-api  # If using PM2
   fly deploy                         # If using Fly.io
   ```

---

## ✅ Final Verification

Before considering deployment complete:

**Functional Tests**:
- [ ] Homepage loads
- [ ] Charts page shows all visualizations
- [ ] Data Explorer filters work
- [ ] Cross-dimensional analysis renders
- [ ] Download CSV works
- [ ] About page displays correctly
- [ ] Sources page loads
- [ ] Footer links all work
- [ ] Link to complementary platform works

**Performance Tests**:
- [ ] Page load time < 3 seconds
- [ ] Charts render in < 2 seconds
- [ ] API response time < 500ms
- [ ] No console errors

**Security Tests**:
- [ ] HTTPS working
- [ ] CORS properly restricts origins
- [ ] No .env files exposed
- [ ] Security headers present

---

## 🎯 Success Criteria

✅ **Deployment is successful when**:

1. Platform is accessible via production URL
2. All features work as expected
3. HTTPS is enforced
4. CORS is properly configured
5. Health check endpoint responds
6. No critical errors in logs
7. Performance is acceptable (< 3s page load)
8. Cross-links to complementary platform work
9. Download functionality works
10. Platform has been stable for 24 hours

---

## 📧 Handoff Complete

Once you've completed this checklist:

1. ✅ Platform deployed and verified
2. ✅ All documentation reviewed
3. ✅ Security checklist complete
4. ✅ 24-hour monitoring successful
5. ✅ Stakeholders notified

**Congratulations! The platform is ready for production use.**

---

**Handoff Checklist Version**: 1.0
**Platform Version**: 1.0
**Date**: 2026-03-22
**Prepared By**: UN-ECA Platform Development Team
**Deployed By**: ________________________
**Deployment Date**: ________________________
**Production URL**: ________________________

