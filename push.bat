
@echo off
title The Viral Rogue - GitHub Uploader

echo.
echo ========================================
echo       THE VIRAL ROGUE - GITHUB
echo ========================================
echo.

git add .

git diff --cached --quiet
if %errorlevel%==0 (
    echo No new changes to upload.
    echo.
    pause
    exit /b
)

git commit -m "Update The Viral Rogue project"

if errorlevel 1 (
    echo.
    echo Commit failed. Please check the error.
    pause
    exit /b 1
)

git push origin main

if errorlevel 1 (
    echo.
    echo GitHub upload failed. Please check the error.
    pause
    exit /b 1
)

echo.
echo ========================================
echo       GITHUB UPDATE SUCCESSFUL!
echo ========================================
echo.
pause
