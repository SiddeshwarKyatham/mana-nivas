@echo off
echo Starting Mana Nivas Frontend...
echo.

cd client
start "Frontend Server" cmd /k "npm install && npm run dev"

echo.
echo Frontend is starting up at: http://localhost:5173
pause
