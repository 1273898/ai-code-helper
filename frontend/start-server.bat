@echo off
echo Starting local web server...
echo.
echo Frontend will be available at: http://localhost:8000
echo Backend should be running at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try Python 3 first
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    REM Try Python 2
    python -m SimpleHTTPServer 8000 2>nul
    if %errorlevel% neq 0 (
        echo Python not found. Please install Python or use another web server.
        echo.
        echo Alternative: Use VS Code Live Server extension
        echo Or: Use Node.js http-server: npx http-server -p 8000
        pause
    )
)

