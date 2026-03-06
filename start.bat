@echo off
setlocal EnableDelayedExpansion
echo ==========================================
echo       AI Heartbeat Detector Launcher
echo ==========================================
echo.

:: 1. Check Node.js Environment
echo [1/3] Checking Node.js Environment...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT found!
    echo.
    echo We have detected that Node.js is missing.
    echo.
    
    if exist "node-installer.msi" (
        echo [INFO] Found local installer: node-installer.msi
        echo.
        echo ========================================================
        echo  PLEASE INSTALL NODE.JS NOW
        echo ========================================================
        echo 1. An installation window will open shortly.
        echo 2. Click "Next", check "I accept", click "Next" repeatedly.
        echo 3. Click "Install" and allow permission if asked.
        echo 4. Click "Finish" when done.
        echo.
        echo Launching installer...
        start /wait msiexec /i "node-installer.msi"
        
        echo.
        echo Checking installation result...
        where node >nul 2>&1
        if !errorlevel! neq 0 (
             echo [FATAL ERROR] Node.js is still not found after installation.
             echo Please restart your computer or try installing manually.
             pause
             exit /b
        )
    ) else (
        echo [ERROR] Installer not found.
        echo Please download and install Node.js from https://nodejs.org/
        pause
        exit /b
    )
)

echo [OK] Node.js is ready.
echo.

:: 1.5 Check Firewall Rules
echo [1.5/3] Checking Firewall Rules...
netsh advfirewall firewall show rule name="AI Heartbeat Port 80" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Adding firewall rule for Port 80...
    powershell -Command "Start-Process cmd -ArgumentList '/c netsh advfirewall firewall add rule name=\"AI Heartbeat Port 80\" dir=in action=allow protocol=TCP localport=80' -Verb RunAs -Wait"
)

netsh advfirewall firewall show rule name="AI Heartbeat Port 3001" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Adding firewall rule for Port 3001...
    powershell -Command "Start-Process cmd -ArgumentList '/c netsh advfirewall firewall add rule name=\"AI Heartbeat Port 3001\" dir=in action=allow protocol=TCP localport=3001' -Verb RunAs -Wait"
)
echo [OK] Firewall rules configured.
echo.

:: 2. Install Dependencies & Start Backend
echo [2/3] Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd server && echo Installing Backend Dependencies... && call npm install && echo Starting Backend... && call npm run dev"

:: 3. Install Dependencies & Start Frontend
echo [3/3] Starting Frontend Client (Port 80)...
start "Frontend Client" cmd /k "cd client && echo Installing Frontend Dependencies... && call npm install && echo Starting Frontend... && call npm run dev"

echo.
echo ==========================================
echo Servers are launching...
echo.
echo Please wait about 30-60 seconds for the first run.
echo.
echo Once ready, your browser should open automatically.
echo If not, visit: http://localhost
echo ==========================================
echo.
pause
