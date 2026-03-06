@echo off
echo Configuring Git...
git config --global user.name "wangwen"
git config --global user.email "wangwen684684@gmail.com"
echo.
echo Git configuration complete.
echo Current configuration:
git config --global --list
pause
