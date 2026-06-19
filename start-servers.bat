@echo off
echo Starting Mana Nivas Backend (Express + Neon)...
cd server
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting Mana Nivas Frontend (Vite)...
cd ../client
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Servers are booting up:
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:5000
echo.
pause

