@echo off
echo ====================================================
echo Africa Health Financing Gap Analysis Platform
echo ====================================================
echo.
echo Starting backend API server...
echo.

cd backend
start "Backend API Server" cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo.
echo Starting frontend React application...
echo.

cd ..\frontend\health-financing-dashboard
start "Frontend React App" cmd /k "npm start"

echo.
echo ====================================================
echo Both servers are starting...
echo ====================================================
echo.
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:3000
echo.
echo Two command prompt windows will open.
echo The browser will automatically open the application.
echo.
echo Press any key to exit this window...
pause > nul
