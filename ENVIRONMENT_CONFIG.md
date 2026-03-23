# Environment Configuration Guide

**Version**: 1.0
**Last Updated**: 2026-03-22
**For**: Health Financing Gap Analysis Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Environment Variables](#backend-environment-variables)
3. [Frontend Environment Variables](#frontend-environment-variables)
4. [Environment Files](#environment-files)
5. [Deployment-Specific Configuration](#deployment-specific-configuration)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Health Financing Gap Analysis Platform uses environment variables to configure both the frontend (React) and backend (Node.js/Express) components. This guide explains all available configuration options and how to use them across different deployment scenarios.

### Important Concepts

**Backend Environment Variables**:
- Loaded at **runtime** using dotenv
- Can be changed without rebuilding
- Stored in `backend/.env` file

**Frontend Environment Variables**:
- Embedded at **build time** by Create React App
- Require rebuild to change
- Must be prefixed with `REACT_APP_`
- Stored in `frontend/health-financing-dashboard/.env.production`

---

## Backend Environment Variables

Location: `backend/.env`

### Required Variables

#### PORT
```env
PORT=5000
```
- **Description**: Port number for the API server
- **Default**: 5000
- **Production**: Often set by hosting platform (e.g., Fly.io uses 8080)
- **Type**: Integer

#### NODE_ENV
```env
NODE_ENV=production
```
- **Description**: Application environment
- **Values**: `development`, `production`, `test`
- **Default**: development
- **Impact**:
  - Affects logging verbosity
  - Enables/disables request logging
  - Used by npm packages for optimization

#### ALLOWED_ORIGINS
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://health-dashboard-winter-sky-9151.fly.dev
```
- **Description**: Comma-separated list of allowed CORS origins
- **Default**: http://localhost:3000
- **Production**: Should include all domains that will access the API
- **Format**: Comma-separated URLs without trailing slashes
- **Example**:
  ```env
  ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://health-dashboard-winter-sky-9151.fly.dev
  ```
- **Security**: Never use `*` in production

### Optional Variables

#### DATA_PATH
```env
DATA_PATH=../processed_data
```
- **Description**: Path to processed data directory (relative to backend/)
- **Default**: ../processed_data
- **Docker**: ./processed_data (data copied into container)

#### ENABLE_REQUEST_LOGGING
```env
ENABLE_REQUEST_LOGGING=true
```
- **Description**: Enable HTTP request logging
- **Values**: true, false
- **Default**: true in development, false in production
- **Impact**: Logs every API request to console

#### LOG_LEVEL
```env
LOG_LEVEL=info
```
- **Description**: Logging verbosity level
- **Values**: error, warn, info, debug
- **Default**: info
- **Recommendation**:
  - Production: info or warn
  - Development: debug
  - Troubleshooting: debug

#### ENABLE_COMPRESSION
```env
ENABLE_COMPRESSION=true
```
- **Description**: Enable gzip compression for API responses
- **Values**: true, false
- **Default**: false
- **Recommendation**: true for production (improves performance)
- **Note**: Requires `compression` package (currently not installed)

#### CACHE_MAX_AGE
```env
CACHE_MAX_AGE=3600
```
- **Description**: Cache-Control max-age for data endpoints (seconds)
- **Default**: 0 (no caching)
- **Values**:
  - 3600 = 1 hour
  - 86400 = 1 day
  - 604800 = 1 week
- **Recommendation**: 3600-7200 for production (data updated infrequently)

#### TRUST_PROXY
```env
TRUST_PROXY=true
```
- **Description**: Trust proxy headers (X-Forwarded-For, etc.)
- **Values**: true, false
- **Default**: false
- **When to use**: Set to true if behind Nginx, Cloudflare, or other reverse proxy

---

## Frontend Environment Variables

Location: `frontend/health-financing-dashboard/.env.production`

### Important Notes

1. **All variables MUST start with `REACT_APP_`**
   - This is a Create React App requirement
   - Variables without this prefix are ignored

2. **Variables are embedded at build time**
   - Changing .env.production requires `npm run build`
   - The built files in `build/` contain the embedded values

3. **All variables are PUBLIC**
   - Visible in browser's JavaScript
   - Never put secrets or API keys here

### Required Variables

#### REACT_APP_API_URL
```env
REACT_APP_API_URL=/api
```
- **Description**: Backend API URL
- **Values**:
  - Development: `http://localhost:5000/api`
  - Production (same domain): `/api`
  - Production (separate domain): `https://api.yourdomain.com/api`
- **Impact**: Determines where frontend makes API calls
- **Important**: Used in `src/services/api.ts`

### Optional Variables

#### REACT_APP_ENV
```env
REACT_APP_ENV=production
```
- **Description**: Environment name for display/logging
- **Values**: development, staging, production
- **Default**: development
- **Use case**: Can display environment badge in UI

#### REACT_APP_GA_ID
```env
REACT_APP_GA_ID=G-XXXXXXXXXX
```
- **Description**: Google Analytics Measurement ID
- **Format**: Starts with G- or UA-
- **Optional**: Only needed if using Google Analytics

#### REACT_APP_DEBUG_MODE
```env
REACT_APP_DEBUG_MODE=false
```
- **Description**: Enable debug logging in browser console
- **Values**: true, false
- **Default**: false
- **Recommendation**: false in production

#### REACT_APP_ENABLE_BETA_FEATURES
```env
REACT_APP_ENABLE_BETA_FEATURES=false
```
- **Description**: Enable experimental features
- **Values**: true, false
- **Default**: false

#### REACT_APP_SENTRY_DSN
```env
REACT_APP_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```
- **Description**: Sentry error tracking DSN
- **Optional**: Only if using Sentry for error monitoring

---

## Environment Files

### Backend Files

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.example` | Template with all variables | ✅ Yes |
| `.env` | Actual configuration | ❌ No |
| `.env.development` | Development overrides | ❌ No |
| `.env.production` | Production overrides | ❌ No |

### Frontend Files

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.example` | Development template | ✅ Yes |
| `.env.production.example` | Production template | ✅ Yes |
| `.env.local` | Local development overrides | ❌ No |
| `.env.production` | Production build config | ❌ No |

### File Priority (Frontend)

Create React App loads .env files in this order (highest priority first):

1. `.env.production.local` (production builds only)
2. `.env.production` (production builds only)
3. `.env.local` (always, except test)
4. `.env`

---

## Deployment-Specific Configuration

### Local Development

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
DATA_PATH=../processed_data
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=debug
```

**Frontend** (`frontend/health-financing-dashboard/.env.local`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DEBUG_MODE=true
REACT_APP_ENV=development
```

**Start Commands**:
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend/health-financing-dashboard
npm start
```

---

### Fly.io Deployment

**Backend**: Set via `fly secrets`
```bash
fly secrets set \
  NODE_ENV=production \
  ALLOWED_ORIGINS="https://health-financing-gap.fly.dev,https://health-dashboard-winter-sky-9151.fly.dev"
```

**Frontend** (`.env.production`):
```env
REACT_APP_API_URL=/api
REACT_APP_ENV=production
REACT_APP_GA_ID=G-XXXXXXXXXX
```

**fly.toml** already includes:
```toml
[env]
  NODE_ENV = "production"
  PORT = "8080"
  DATA_PATH = "./processed_data"
```

**Deployment**:
```bash
npm run build  # Build frontend first
fly deploy     # Deploy to Fly.io
```

---

### VPS/Traditional Server

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DATA_PATH=../processed_data
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
ENABLE_COMPRESSION=true
CACHE_MAX_AGE=3600
TRUST_PROXY=true
```

**Frontend** (`.env.production`):
```env
REACT_APP_API_URL=/api
REACT_APP_ENV=production
REACT_APP_GA_ID=G-XXXXXXXXXX
```

**Setup Steps**:
```bash
# 1. Create backend .env
cd /var/www/health-financing-platform/backend
nano .env
# (Paste backend configuration above)

# 2. Create frontend .env.production
cd /var/www/health-financing-platform/frontend/health-financing-dashboard
nano .env.production
# (Paste frontend configuration above)

# 3. Build frontend
npm run build

# 4. Start backend with PM2
pm2 start server.js --name health-financing-api
pm2 save
pm2 startup

# 5. Configure Nginx (see nginx.conf.example)
sudo cp ../../nginx.conf.example /etc/nginx/sites-available/health-financing
# Edit file with your domain
sudo ln -s /etc/nginx/sites-available/health-financing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Vercel (Frontend Only)

**Environment Variables** (set in Vercel dashboard):
- `REACT_APP_API_URL` = `https://your-backend-domain.com/api`
- `REACT_APP_ENV` = `production`
- `REACT_APP_GA_ID` = `G-XXXXXXXXXX`

**Backend**: Deploy separately (Heroku, Railway, etc.)

---

### Docker

**Backend**: Set via `docker run -e` or docker-compose.yml

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - ALLOWED_ORIGINS=http://localhost:8080,https://yourdomain.com
      - DATA_PATH=./processed_data
      - ENABLE_REQUEST_LOGGING=true
      - ENABLE_COMPRESSION=true
      - CACHE_MAX_AGE=3600
```

**Frontend**: Build args in Dockerfile
```dockerfile
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
```

**Build with custom API URL**:
```bash
docker build --build-arg REACT_APP_API_URL=https://api.yourdomain.com/api -t health-financing-platform .
```

---

## Security Best Practices

### 1. Never Commit .env Files
Add to `.gitignore`:
```
.env
.env.local
.env.*.local
backend/.env
backend/.env.*
frontend/health-financing-dashboard/.env
frontend/health-financing-dashboard/.env.local
frontend/health-financing-dashboard/.env.*.local
```

### 2. CORS Configuration
```env
# ❌ NEVER in production
ALLOWED_ORIGINS=*

# ✅ Specific domains only
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Environment-Specific Settings

| Setting | Development | Production |
|---------|-------------|------------|
| NODE_ENV | development | production |
| LOG_LEVEL | debug | info or warn |
| ENABLE_REQUEST_LOGGING | true | true (filtered) |
| REACT_APP_DEBUG_MODE | true | false |
| ALLOWED_ORIGINS | localhost | Specific domains |

### 4. Secrets Management

**For Fly.io**:
```bash
fly secrets set DATABASE_URL=xxx
fly secrets list
```

**For VPS**: Use environment variables in PM2 ecosystem file:
```javascript
module.exports = {
  apps: [{
    name: 'health-financing-api',
    script: './server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Symptom**: API calls fail with CORS error or 404

**Check**:
1. Frontend .env.production has correct REACT_APP_API_URL
2. Frontend was rebuilt after changing .env.production
3. Backend ALLOWED_ORIGINS includes frontend domain
4. Backend is running on expected port

**Verify**:
```bash
# Check embedded API URL in built frontend
grep -r "REACT_APP_API_URL" frontend/health-financing-dashboard/build/static/js/

# Test backend health
curl http://localhost:5000/api/health

# Check CORS
curl -H "Origin: https://yourdomain.com" -I http://localhost:5000/api/health
```

---

### Environment Variables Not Loading

**Backend**:
```bash
# Check .env file exists
ls -la backend/.env

# Verify dotenv is called in server.js
grep "dotenv" backend/server.js

# Start server and check logs for loaded config
cd backend && npm start
```

**Frontend**:
```bash
# Verify variable starts with REACT_APP_
# Verify you rebuilt after changing .env.production
cd frontend/health-financing-dashboard
npm run build

# Check if variable is in build
grep "your-api-url" build/static/js/main.*.js
```

---

### CORS Errors

**Error**: "Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy"

**Fix**:
1. Check backend .env has correct ALLOWED_ORIGINS
2. Restart backend after changing .env
3. Verify backend logs show correct allowed origins on startup

**Backend logs should show**:
```
Allowed origins: http://localhost:3000
```

---

### Port Already in Use

**Error**: "Port 5000 is already in use"

**Fix**:
```bash
# Find process using port
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)

# Or change port in .env
PORT=5001
```

---

## Quick Reference

### Backend .env Template
```env
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
DATA_PATH=../processed_data
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
ENABLE_COMPRESSION=true
CACHE_MAX_AGE=3600
```

### Frontend .env.production Template
```env
REACT_APP_API_URL=/api
REACT_APP_ENV=production
```

### Verification Checklist
- [ ] Backend .env file exists and has correct values
- [ ] Frontend .env.production exists and has correct REACT_APP_API_URL
- [ ] Frontend rebuilt after changing .env.production (`npm run build`)
- [ ] Backend ALLOWED_ORIGINS includes frontend domain
- [ ] Both backend and frontend are using HTTPS in production
- [ ] No .env files committed to Git

---

**Document Version**: 1.0
**Last Updated**: 2026-03-22
**Maintained By**: UN-ECA Platform Team

