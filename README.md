# Africa Health Financing Gap Analysis Platform

**Version**: 1.0
**Last Updated**: 2026-03-22
**Organization**: United Nations Economic Commission for Africa (UN-ECA)

---

## 📊 Overview

The Africa Health Financing Gap Analysis Platform provides comprehensive insights into health financing across 54 African countries from 2000 to 2023. This interactive web platform enables policy makers, researchers, and development partners to analyze health financing trends, gaps, and progress toward international benchmarks.

### Key Features

- **Comprehensive Coverage**: 54 African countries, 24 years (2000-2023)
- **10 Indicator Categories**: Public financing, budget priority, financial protection, UHC, health outcomes, and more
- **Interactive Visualizations**: Dynamic charts, maps, and trend analyses
- **Cross-Dimensional Analysis**: Explore relationships between financing and health outcomes
- **Data Explorer**: Filter and download data for custom analysis
- **Regional Comparisons**: View by income level and sub-region

### Data Source

All data sourced from **WHO Global Health Expenditure Database (GHED)** - the authoritative source for internationally comparable health financing data.

**Download Source**: https://apps.who.int/nha/database/Home/IndicatorsDownload/en

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Charts**: Recharts, D3.js
- **Routing**: React Router v7
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express 5
- **Language**: JavaScript (CommonJS)
- **Data Format**: JSON files

### Deployment
- **Hosting**: ECAStats Platform (UN-ECA's official statistics platform)
- **Integration**: Works alongside Health Financing Dashboard
- **Technical**: Node.js backend + React frontend

---

## 📁 Project Structure

```
health-financing-platform/
├── backend/                          # Node.js/Express API server
│   ├── server.js                     # Main server file
│   ├── package.json                  # Backend dependencies
│   └── .env.example                  # Environment template
│
├── frontend/
│   └── health-financing-dashboard/   # React application
│       ├── public/                   # Static assets
│       │   └── eca-logo.png         # UN-ECA logo
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── pages/               # Page components
│       │   ├── services/            # API services
│       │   ├── theme.css            # Global theme
│       │   └── index.tsx            # Entry point
│       ├── package.json             # Frontend dependencies
│       ├── .env.example             # Dev environment template
│       └── .env.production.example  # Prod environment template
│
├── processed_data/                   # Health financing data (JSON)
│   ├── master_dataset.json          # Complete dataset (4.4 MB)
│   ├── metadata.json                # Countries, years, regions
│   ├── budget_priority/             # Abuja Declaration indicators
│   ├── cross_dimensional/           # Financing × outcomes analysis
│   ├── financial_protection/        # OOP and financial hardship
│   ├── financing_structure/         # Financing sources
│   ├── fiscal_space/                # Fiscal capacity indicators
│   ├── health_outcomes/             # Mortality indicators
│   ├── public_health_financing/     # Government health expenditure
│   └── uhc/                         # Universal health coverage
│
├── DEPLOYMENT_GUIDE.md              # Complete deployment instructions
├── ENVIRONMENT_CONFIG.md            # Environment variables reference
├── USER_GUIDE.md                    # End-user navigation guide
├── HANDOFF_CHECKLIST.md            # Pre-deployment checklist
├── DATA_SOURCE_DOCUMENTATION.md     # Data provenance
│
├── fly.toml                         # Fly.io configuration
├── Dockerfile                       # Container build
├── .dockerignore                    # Docker exclusions
├── nginx.conf.example               # Nginx config (VPS)
├── .gitignore                       # Git exclusions
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 16.x or higher (18.x or 20.x LTS recommended)
- **npm**: 8.x or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd health-financing-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend/health-financing-dashboard
   npm install
   ```

4. **Configure environment variables**

   **Backend** (`backend/.env`):
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000
   DATA_PATH=../processed_data
   ENABLE_REQUEST_LOGGING=true
   ```

   **Frontend** (`frontend/health-financing-dashboard/.env.local`):
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_DEBUG_MODE=true
   ```

5. **Start the development servers**

   **Terminal 1 - Backend**:
   ```bash
   cd backend
   npm start
   ```
   Server runs at http://localhost:5000

   **Terminal 2 - Frontend**:
   ```bash
   cd frontend/health-financing-dashboard
   npm start
   ```
   App opens automatically at http://localhost:3000

### Verify Installation

- ✅ Backend health check: http://localhost:5000/api/health
- ✅ Frontend loads with UN-ECA logo
- ✅ Charts display properly
- ✅ Navigation works

---

## 📦 Deployment

### For Complete Deployment Instructions

👉 **READ**: `DEPLOYMENT_GUIDE.md`

This comprehensive guide covers:
- Four deployment options (Fly.io, VPS, Docker, Vercel)
- Step-by-step instructions
- Environment configuration
- SSL/HTTPS setup
- Post-deployment verification
- Troubleshooting

### ECAStats Platform Hosting

This platform is hosted on **ECAStats**, the United Nations Economic Commission for Africa's official statistics platform, alongside the Health Financing Dashboard.

**Platform Suite**:
- **Health Financing Dashboard** - Real-time monitoring and executive summaries
- **Gap Analysis Platform** (this repository) - Deep-dive analysis, trends, and policy insights

**For deployment and hosting configuration**:
- Consult `DEPLOYMENT_GUIDE.md` for technical requirements
- Contact UN-ECA platform administrators for ECAStats integration
- See `ENVIRONMENT_CONFIG.md` for environment variable setup

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment (development/production) |
| `ALLOWED_ORIGINS` | Yes | http://localhost:3000 | CORS allowed origins (comma-separated) |
| `DATA_PATH` | No | ../processed_data | Path to data directory |
| `ENABLE_REQUEST_LOGGING` | No | true | Enable HTTP request logging |
| `LOG_LEVEL` | No | info | Logging level (error/warn/info/debug) |

### Frontend (`frontend/health-financing-dashboard/.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API URL (e.g., /api or https://api.domain.com/api) |
| `REACT_APP_ENV` | No | Environment name for display |
| `REACT_APP_GA_ID` | No | Google Analytics ID |

**⚠️ Important**: All frontend variables MUST start with `REACT_APP_`

For detailed configuration, see `ENVIRONMENT_CONFIG.md`

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **DEPLOYMENT_GUIDE.md** | Complete deployment instructions |
| **ENVIRONMENT_CONFIG.md** | Environment variables reference |
| **USER_GUIDE.md** | End-user platform navigation |
| **HANDOFF_CHECKLIST.md** | Pre-deployment checklist |
| **DATA_SOURCE_DOCUMENTATION.md** | Data provenance and processing |
| **README.md** | This overview document |

---

## 🏛️ Part of ECAStats Platform

This Gap Analysis Platform is hosted on **ECAStats**, the United Nations Economic Commission for Africa's official statistics platform, where it works alongside the **Health Financing Dashboard**.

**Platform Suite**:
- **Health Financing Dashboard**: Real-time monitoring, quick stats, executive summaries
- **Gap Analysis Platform** (this repository): Deep-dive into gaps, trends, cross-dimensional analysis

**Integration**:
- Both platforms hosted on ECAStats
- Unified branding and navigation
- Complementary analytics capabilities
- Cross-links in footer and About page

---

## 📊 Data

### Source
All data from **WHO Global Health Expenditure Database (GHED)**

### Coverage
- **Countries**: 54 African nations
- **Years**: 2000-2023 (24 years)
- **Indicators**: 100+ health financing indicators across 10 categories

### Size
- Total: ~7.2 MB (compressed in Git)
- Format: JSON files
- Location: `processed_data/` directory

### Update Frequency
- WHO GHED updates annually (Q2-Q3)
- Platform data current through 2023

---

## 🛠️ Development

### Available Scripts

**Backend**:
```bash
npm start       # Start server (production)
npm run dev     # Start with nodemon (auto-reload)
```

**Frontend**:
```bash
npm start       # Development server (hot reload)
npm run build   # Production build
npm test        # Run tests
```

### Building for Production

```bash
cd frontend/health-financing-dashboard
npm run build
```

Output: `frontend/health-financing-dashboard/build/`

---

## 🔐 Security

### Pre-Deployment Checklist

- [ ] SSL certificate installed (HTTPS only)
- [ ] Environment variables not committed (.env in .gitignore)
- [ ] CORS properly configured (specific domains, not `*`)
- [ ] Security headers configured
- [ ] Dependencies audited (`npm audit`)
- [ ] Firewall configured
- [ ] Backups strategy in place

For complete security checklist, see `HANDOFF_CHECKLIST.md`

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

1. Check `REACT_APP_API_URL` in `.env.production`
2. Rebuild frontend after changing env: `npm run build`
3. Verify backend `ALLOWED_ORIGINS` includes frontend domain
4. Test backend: `curl http://localhost:5000/api/health`

### Backend Won't Start

```bash
# Check if port is in use
lsof -ti:5000

# Kill process if needed
kill -9 $(lsof -ti:5000)

# Verify .env file exists
cat backend/.env
```

### Charts Not Rendering

1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify API calls in Network tab
4. Test API endpoint: `curl http://localhost:5000/api/indicators/public-health-financing`

For more solutions, see `DEPLOYMENT_GUIDE.md` → Troubleshooting section

---

## 📞 Support

### Platform Issues
**Organization**: United Nations Economic Commission for Africa (UN-ECA)
**Location**: Addis Ababa, Ethiopia
**Website**: https://www.uneca.org

### Data Questions
**Organization**: WHO Global Health Expenditure Database
**Email**: healthaccounts@who.int
**Website**: https://apps.who.int/nha/database

---

## 📄 License

© 2026 United Nations Economic Commission for Africa (ECA). All rights reserved.

---

## 🙏 Acknowledgments

- **Data Source**: WHO Global Health Expenditure Database (GHED)
- **Organization**: United Nations Economic Commission for Africa (UN-ECA)
- **Platform Host**: ECAStats - UN-ECA's official statistics platform
- **Platform Suite**: Health Financing Dashboard + Gap Analysis Platform

---

## 🚀 Getting Started

**New to the platform?**

1. **Users**: Start with `USER_GUIDE.md`
2. **Deployers**: Start with `HANDOFF_CHECKLIST.md`, then `DEPLOYMENT_GUIDE.md`
3. **Developers**: Start with this README, then explore the code

**Ready to deploy?**

👉 Open `HANDOFF_CHECKLIST.md` and follow the step-by-step process

---

**Platform Version**: 1.0
**Last Updated**: 2026-03-22
**Maintained By**: UN-ECA Platform Team
