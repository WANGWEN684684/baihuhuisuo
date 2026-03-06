@echo off
setlocal EnableDelayedExpansion
echo ==========================================
echo       AI Heartbeat Detector - Public Share
echo ==========================================
echo.

:: 1. Check Node.js Environment
echo [1/4] Checking Node.js Environment...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT found!
    echo Please run 'start.bat' first to install Node.js.
    pause
    exit /b
)
echo [OK] Node.js is ready.
echo.

:: 2. Build Frontend
echo [2/4] Building Frontend...
cd client
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b
)
cd ..
echo [OK] Frontend built successfully.
echo.

:: 3. Start Server (Background)
echo [3/4] Starting Server...
start "Backend Server" cmd /k "cd server && npm install && node index.js"
echo [OK] Server started on port 3001.
echo.

:: 3.5 Check Environment Variables
if not exist "server\.env" (
    echo [WARNING] server\.env file not found!
    echo Analysis might fail without API keys.
)

:: 4. Start Public Tunnel
echo [4/4] Creating Public Link...
echo.
echo ==========================================
echo  IMPORTANT - PLEASE READ:
echo.
echo  1. A new URL will be generated below (e.g. https://xxxx.loca.lt).
echo  2. Copy and send it to your friends.
echo.
echo  3. *** PASSWORD REQUIRED ***
echo     When opening the link, it will ask for a "Tunnel Password".
echo     The password is your Public IP address.
echo.
echo     YOUR PASSWORD IS:
echo     --------------------------------------------------
curl -s https://api.ipify.org
echo.
echo     --------------------------------------------------
echo.
echo     (Copy the IP address above and paste it into the password field)
echo ==========================================
echo.
echo Installing localtunnel (this might take a moment)...
call npm list -g localtunnel >nul 2>&1
if %errorlevel% neq 0 (
    call npm install -g localtunnel
)
echo.
echo Launching tunnel...
echo Waiting for server to start...
timeout /t 5
echo.
echo ==========================================
echo  Your Tunnel URL is below:
echo  (Copy this URL and send to your friends)
echo ==========================================
echo.
call lt --port 3001
pause
