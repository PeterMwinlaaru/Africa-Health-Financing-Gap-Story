# Deployment Guide
## Africa Health Financing Gap Analysis Platform

**Version**: 1.1
**Last Updated**: 2026-03-29
**For**: Production Deployment to Web

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Installation Steps](#installation-steps)
6. [Building for Production](#building-for-production)
7. [Deployment Options](#deployment-options)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### ECAStats Platform Hosting

**Important**: This platform is hosted on **ECAStats**, the United Nations Economic Commission for Africa's official statistics platform.

**Platform Suite**:
- **Health Financing Dashboard** - Real-time monitoring and executive summaries
- **Gap Analysis Platform** (this repository) - Deep-dive analysis, trends, and policy insights

**Deployment Approach**:
- Both platforms are hosted on the ECAStats infrastructure
- This guide provides technical documentation for the application components
- For ECAStats-specific deployment procedures, consult with UN-ECA platform administrators
- The deployment options below serve as reference for understanding the technical requirements

### Platform Components

This platform consists of two main components:

**1. Frontend (React Application)**
- Location: `frontend/health-financing-dashboard/`
- Technology: React 19 + TypeScript
- Build Tool: Create React App (react-scripts)
- Port (Development): 3000

**2. Backend (Node.js API Server)**
- Location: `backend/`
- Technology: Node.js + Express 5
- Port (Development): 5000

---

## Prerequisites

### Required Software

```bash
Node.js: >= 16.x (Recommended: 18.x or 20.x LTS)
npm: >= 8.x (comes with Node.js)
Git: Latest version
```

### System Requirements

**Development/Build Machine**:
- RAM: Minimum 4GB (8GB recommended)
- Disk Space: 2GB free space
- OS: Windows, macOS, or Linux

**Production Server**:
- RAM: Minimum 2GB (4GB recommended for smooth operation)
- Disk Space: 500MB for application + data
- Node.js runtime environment

### Optional (But Recommended)

- **PM2**: Process manager for Node.js (production)
- **Nginx**: Reverse proxy and static file serving
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

---

## Project Structure

```
health-financing-platform/
├── frontend/
│   └── health-financing-dashboard/
│       ├── public/              # Static assets
│       │   └── eca-logo.png    # UN-ECA logo (7.4KB)
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Page components
│       │   ├── theme.css       # Global theme variables
│       │   └── index.tsx       # Entry point
│       ├── package.json        # Frontend dependencies
│       └── .env.example        # Environment variables template
├── backend/
│   ├── server.js              # Express API server
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Backend env template
├── data-processing/           # Data files (CSV)
├── processed_data/            # Processed data files
└── DEPLOYMENT_GUIDE.md        # This file
```

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```env
# Backend Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (configure for ECAStats domain)
ALLOWED_ORIGINS=https://ecastats.uneca.org

# Data Configuration
DATA_PATH=../processed_data

# Optional: Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `.env.production` file in `frontend/health-financing-dashboard/`:

```env
# API Configuration
REACT_APP_API_URL=https://your-api-domain.com/api
# OR if serving from same domain:
REACT_APP_API_URL=/api

# Optional: Analytics
# REACT_APP_GA_ID=UA-XXXXXXXXX-X

# Optional: Environment indicator
REACT_APP_ENV=production
```

**Important**: The frontend environment variables must be prefixed with `REACT_APP_` to be accessible in React.

---

## Installation Steps

### Step 1: Clone/Extract the Project

```bash
# If using Git
git clone <repository-url>
cd health-financing-platform

# If using ZIP file
# Extract the ZIP file to your desired location
cd health-financing-platform
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected Output**:
```
added XX packages in XXs
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend/health-financing-dashboard
npm install
```

**Expected Output**:
```
added XXX packages in XXs
```

**Note**: This may take 3-5 minutes depending on internet speed.

### Step 4: Verify Installation

```bash
# Check backend
cd ../../backend
npm list --depth=0

# Check frontend
cd ../frontend/health-financing-dashboard
npm list --depth=0
```

---

## Building for Production

### Build Frontend Application

```bash
cd frontend/health-financing-dashboard

# Production build
npm run build
```

**Expected Output**:
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
  XX.XX kB  build/static/js/main.XXXXXXXX.js
  XX.XX kB  build/static/css/main.XXXXXXXX.css

The project was built assuming it is hosted at /.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.
```

**Build Output Location**: `frontend/health-financing-dashboard/build/`

### Verify Build

```bash
# Check build folder
ls -la build/

# You should see:
# - index.html
# - static/ (folder with JS, CSS, media)
# - manifest.json
# - robots.txt
```

### Build Optimization

The production build automatically:
- ✅ Minifies JavaScript and CSS
- ✅ Optimizes images
- ✅ Removes console logs
- ✅ Generates source maps (optional)
- ✅ Code splitting for faster load times
- ✅ Tree shaking to remove unused code

---

## Deployment Options

**Note**: The following deployment options are provided as technical reference. This platform is officially hosted on the ECAStats infrastructure. Consult with UN-ECA platform administrators for ECAStats-specific deployment procedures.

### Option 1: Deploy to Fly.io (Reference/Development)

This option can be used for development, testing, or reference purposes.

#### Prerequisites
```bash
# Install Fly CLI
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Verify installation
fly version
```

#### Deployment Steps

**1. Create fly.toml Configuration**

See `fly.toml.example` (will create this separately)

**2. Log in to Fly.io**
```bash
fly auth login
```

**3. Launch the Application**
```bash
# From project root
fly launch

# Follow prompts:
# - App name: health-financing-gap (or your choice)
# - Region: Choose closest to Africa (Johannesburg recommended)
# - PostgreSQL: No (we use flat files)
# - Redis: No
```

**4. Deploy**
```bash
fly deploy
```

**5. Open Your App**
```bash
fly open
```

---

### Option 2: Deploy to Vercel (Alternative)

#### Prerequisites
```bash
npm install -g vercel
```

#### Deployment Steps

**1. Navigate to Frontend**
```bash
cd frontend/health-financing-dashboard
```

**2. Deploy**
```bash
vercel --prod
```

**3. Configure Backend Separately**
- Deploy backend to separate service (Heroku, Railway, etc.)
- Update REACT_APP_API_URL to point to backend URL

---

### Option 3: Deploy to Traditional Server (VPS)

For deployment to Ubuntu/Debian server:

#### Server Setup

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Install Nginx
sudo apt install nginx -y

# 5. Install certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

#### Upload Project Files

```bash
# Using SCP
scp -r health-financing-platform/ user@your-server:/var/www/

# Or using Git
ssh user@your-server
cd /var/www
git clone <repository-url>
```

#### Setup Backend

```bash
cd /var/www/health-financing-platform/backend
npm install --production

# Create .env file
nano .env
# (Add production environment variables)

# Start with PM2
pm2 start server.js --name health-financing-api
pm2 save
pm2 startup
```

#### Setup Nginx

```nginx
# /etc/nginx/sites-available/health-financing

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (static files)
    location / {
        root /var/www/health-financing-platform/frontend/health-financing-dashboard/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets cache
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable Site**:
```bash
sudo ln -s /etc/nginx/sites-available/health-financing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Setup SSL**:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Option 4: Docker Deployment

See `DOCKER_DEPLOYMENT.md` (will create separately) for containerized deployment.

---

## Post-Deployment Configuration

### 1. Verify Deployment

```bash
# Check if site is accessible
curl -I https://yourdomain.com

# Expected: HTTP/1.1 200 OK
```

### 2. Test API Endpoints

```bash
# Test backend API
curl https://yourdomain.com/api/health

# Expected: {"status": "ok"}

# Test data endpoint
curl https://yourdomain.com/api/data/master | head -20

# Expected: JSON data array
```

### 3. Update Cross-Links

The platform has cross-links to the complementary dashboard. Ensure the URLs are correct:
- Footer link: https://health-dashboard-winter-sky-9151.fly.dev/
- About page link: https://health-dashboard-winter-sky-9151.fly.dev/

### 4. Configure DNS

```
A Record:     yourdomain.com → Server IP
CNAME Record: www.yourdomain.com → yourdomain.com
```

### 5. Security Headers

Add to Nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## Monitoring & Maintenance

### Health Checks

**Backend Health Endpoint**: `/api/health`

```bash
# Setup monitoring with uptime check
curl https://yourdomain.com/api/health
```

### PM2 Monitoring (if using VPS)

```bash
# View logs
pm2 logs health-financing-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart health-financing-api

# View status
pm2 status
```

### Log Rotation

```bash
# Setup log rotation for PM2
pm2 install pm2-logrotate
```

### Backup Strategy

**Data Files**:
```bash
# Backup processed data
cd /var/www/health-financing-platform
tar -czf backup-$(date +%Y%m%d).tar.gz processed_data/

# Store backups securely
```

### Updates

**To update the platform**:
```bash
# 1. Backup current version
# 2. Pull updates
git pull origin main

# 3. Update dependencies
cd backend && npm install
cd ../frontend/health-financing-dashboard && npm install

# 4. Rebuild frontend
npm run build

# 5. Restart backend
pm2 restart health-financing-api
```

---

## Troubleshooting

### Issue: Frontend Shows "Cannot connect to API"

**Cause**: CORS or wrong API URL

**Fix**:
1. Check `.env.production` has correct `REACT_APP_API_URL`
2. Verify backend `.env` has correct `ALLOWED_ORIGINS`
3. Rebuild frontend after changing env variables

### Issue: Backend Not Starting

**Check**:
```bash
# View logs
pm2 logs health-financing-api

# Common issues:
# - Port 5000 already in use
# - Missing .env file
# - Node version too old
```

**Fix**:
```bash
# Kill process on port 5000
sudo lsof -ti:5000 | xargs kill -9

# Check Node version
node --version  # Should be >= 16.x
```

### Issue: Charts Not Rendering

**Cause**: Large dataset or missing dependencies

**Check**:
1. Browser console for errors (F12)
2. Network tab for failed API calls
3. Verify data files exist in `processed_data/`

### Issue: Build Fails

**Error**: "JavaScript heap out of memory"

**Fix**:
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Issue: Slow Performance

**Check**:
1. Enable gzip compression in Nginx
2. Verify CDN/caching is working
3. Check server resources (RAM, CPU)

**Nginx Gzip Config**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## Performance Optimization

### Frontend Optimization

**1. Enable Service Worker** (already included in CRA build)

**2. Lazy Loading**
- Routes are already code-split
- Images load on-demand

**3. CDN Integration** (Optional)
```bash
# Upload build/static/* to CDN
# Update index.html to reference CDN URLs
```

### Backend Optimization

**1. Enable Compression**
```javascript
// In server.js
const compression = require('compression');
app.use(compression());
```

**2. Caching**
```javascript
// Cache static data responses
app.use('/api/data', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

---

## Security Checklist

Before going live:

- [ ] SSL certificate installed (HTTPS only)
- [ ] Environment variables not committed to Git
- [ ] CORS properly configured (not `*` in production)
- [ ] Security headers configured
- [ ] Dependencies updated (no known vulnerabilities)
- [ ] API rate limiting configured (if needed)
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring/alerts configured

---

## Support & Contacts

### Platform Deployment Issues

Contact: UN-ECA Technical Team
Website: https://www.uneca.org

### Complementary Platform

Dashboard: https://health-dashboard-winter-sky-9151.fly.dev/
Purpose: Real-time health financing monitoring

### Data Source Issues

WHO GHED: healthaccounts@who.int
Portal: https://apps.who.int/nha/database

---

## Quick Reference Commands

### Development
```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend/health-financing-dashboard && npm start
```

### Production Build
```bash
# Build frontend
cd frontend/health-financing-dashboard
npm run build
```

### Deployment (Fly.io)
```bash
fly deploy
fly open
fly logs
```

### Server Management (VPS)
```bash
pm2 status
pm2 logs health-financing-api
pm2 restart health-financing-api
sudo systemctl reload nginx
```

---

## Additional Documentation

- `PRODUCTION_CONFIG.md` - Detailed production configuration
- `DOCKER_DEPLOYMENT.md` - Docker containerization guide
- `USER_GUIDE.md` - End-user platform navigation guide
- `HANDOFF_CHECKLIST.md` - Pre-deployment checklist

---

**Document Version**: 1.1
**Last Updated**: 2026-03-29
**Maintained By**: UN-ECA Platform Team
**For Questions**: Contact deployment team lead
