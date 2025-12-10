# PowerShell script to start a local web server
Write-Host "Starting local web server..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Backend should be running at: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Try Python 3 first
try {
    python -m http.server 8000
} catch {
    # Try Python 2
    try {
        python -m SimpleHTTPServer 8000
    } catch {
        Write-Host "Python not found. Please install Python or use another web server." -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative options:" -ForegroundColor Yellow
        Write-Host "1. Use VS Code Live Server extension"
        Write-Host "2. Use Node.js: npx http-server -p 8000"
        Write-Host ""
        Read-Host "Press Enter to exit"
    }
}

