@echo off
echo ==========================================
echo       Syncing Project to GitHub
echo ==========================================
echo.

:: Configure remote origin (if not already set)
git remote remove origin >nul 2>&1
git remote add origin https://github.com/WANGWEN684684/baihuhuisuo.git

:: Rename branch to main (standard practice)
git branch -M main

:: Push to remote
echo Pushing code to GitHub...
echo If a login window pops up, please sign in.
echo.
:: Try to increase buffer size for large pushes
git config http.postBuffer 524288000
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo Possible reasons:
    echo 1. You are not logged in to GitHub.
    echo 2. The repository does not exist.
    echo 3. You don't have permission to push to this repository.
    echo.
    echo Please check the error message above.
    pause
    exit /b
)

echo.
echo [SUCCESS] Project synced to GitHub successfully!
echo.
pause
