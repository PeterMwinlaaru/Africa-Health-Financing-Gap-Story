# =============================================
# Multi-stage Dockerfile for Health Financing Gap Analysis Platform
# =============================================
# This Dockerfile builds both frontend and backend in a single container
# Suitable for Fly.io, Docker, and other container platforms

# =============================================
# Stage 1: Build Frontend
# =============================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/health-financing-dashboard/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/health-financing-dashboard/ ./

# Build frontend for production
# Environment variables are embedded at build time
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_ENV=production

RUN npm run build

# =============================================
# Stage 2: Build Backend and Final Image
# =============================================
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache dumb-init

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy processed data
COPY processed_data/ ./processed_data/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create a simple static file server using express
RUN echo 'const express = require("express"); \
const path = require("path"); \
const app = express(); \
app.use(express.static(path.join(__dirname, "frontend/build"))); \
app.get("/*", (req, res) => { \
  res.sendFile(path.join(__dirname, "frontend/build/index.html")); \
}); \
module.exports = app;' > static-server.js

# Update server.js to serve static files
RUN echo '\nconst staticServer = require("./static-server"); \
app.use("/", staticServer);' >> server.js

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_PATH=./processed_data

# Expose port
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# =============================================
# Build Instructions
# =============================================
#
# Build the image:
#   docker build -t health-financing-platform .
#
# Run the container:
#   docker run -p 8080:8080 \
#     -e ALLOWED_ORIGINS="http://localhost:8080" \
#     health-financing-platform
#
# Run with custom environment variables:
#   docker run -p 8080:8080 \
#     -e NODE_ENV=production \
#     -e ALLOWED_ORIGINS="https://yourdomain.com" \
#     -e CACHE_MAX_AGE=7200 \
#     health-financing-platform
#
# =============================================
# Deployment to Fly.io
# =============================================
#
# 1. fly launch (first time)
# 2. fly deploy
# 3. fly open
#
# =============================================
