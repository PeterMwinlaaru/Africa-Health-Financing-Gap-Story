# Quick Start Guide

## Running the Complete Application

Follow these steps to get the Health Financing Gap platform up and running:

### Step 1: Start the Backend API Server

```bash
# Navigate to backend directory
cd "C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\backend"

# Start the server
npm start
```

You should see:
```
Health Financing Gap API Server running on port 5000
Data directory: C:\Users\...\processed_data
API endpoints available at http://localhost:5000/api/
```

**Test the API:**
Open your browser and visit: `http://localhost:5000/api/health`

You should see: `{"status":"OK","message":"Health Financing Gap API is running"}`

### Step 2: Start the Frontend React App

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory
cd "C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\frontend\health-financing-dashboard"

# Start the React development server
npm start
```

The application will automatically open in your browser at: `http://localhost:3000`

### Step 3: Explore the Platform

Once both servers are running, you can:

1. **View the Dashboard** - Main page with key visualizations
2. **Filter data** - Use the year and region dropdowns
3. **Explore charts** - Interactive charts respond to your selections
4. **Navigate** - Use the top menu to explore different sections

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Edit backend/server.js and change the PORT variable
# Or set environment variable:
set PORT=5001
npm start
```

**Cannot find data files:**
- Ensure the data processing step completed successfully
- Check that `processed_data/` folder exists and contains JSON files

### Frontend Issues

**Port 3000 already in use:**
- React will prompt you to use a different port (usually 3001)
- Type 'y' to accept

**API connection errors:**
- Ensure the backend server is running on port 5000
- Check browser console for specific error messages

**Module not found:**
```bash
# Reinstall dependencies
npm install
```

## Development Mode

Both servers support hot reload:
- **Backend**: Changes to server.js will be detected (if using nodemon: `npm run dev`)
- **Frontend**: Changes to React components will auto-refresh the browser

## Building for Production

### Backend
```bash
cd backend
npm start  # Production mode uses node directly
```

### Frontend
```bash
cd frontend/health-financing-dashboard
npm run build

# Serve the built files
npx serve -s build
```

## Data Updates

To reprocess the data with updated source files:

```bash
cd data-processing
python process_indicators.py
```

This will regenerate all indicator files in `processed_data/`.

## Next Steps

1. **Customize**: Edit component files in `frontend/src/`
2. **Add features**: Implement the "Coming Soon" pages
3. **Style**: Modify CSS files to match your branding
4. **Deploy**: Consider deploying to a server for production use

## Keyboard Shortcuts (Development)

**Frontend:**
- `Ctrl + C` - Stop the development server
- Browser will auto-refresh on file changes

**Backend:**
- `Ctrl + C` - Stop the API server
- Restart manually after changes (unless using nodemon)

## Common Tasks

### Add a new indicator:
1. Update `data-processing/process_indicators.py`
2. Run the processing script
3. Add new API endpoint in `backend/server.js`
4. Create visualization component in React
5. Add to Dashboard or create new page

### Change the color scheme:
- Edit CSS files in `frontend/src/components/` and `frontend/src/pages/`
- Main colors are defined in individual CSS files

### Add new charts:
- Use Recharts components (already installed)
- See Dashboard.tsx for examples
- Reference: https://recharts.org/

## Performance Tips

- Backend response times are typically <100ms for most queries
- Frontend charts render efficiently with thousands of data points
- For better performance with large datasets, consider implementing pagination

## Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints in backend/server.js
- Examine example implementations in Dashboard.tsx
- Consult React documentation: https://react.dev
- Consult Recharts documentation: https://recharts.org

---

**Happy coding!** 🚀
