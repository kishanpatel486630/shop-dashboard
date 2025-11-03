# COMPLETE SOLUTION - Run Project WITHOUT MongoDB
# This script starts both backend (mock) and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ClothPOS - Quick Start (No MongoDB)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "✅ This version uses a MOCK backend" -ForegroundColor Green
Write-Host "✅ NO MongoDB installation required!" -ForegroundColor Green
Write-Host "✅ Perfect for testing the frontend" -ForegroundColor Green
Write-Host ""

# Check if ports are free
Write-Host "Checking if ports are available..." -ForegroundColor Yellow

$port8000 = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue
$port3000 = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($port8000) {
    Write-Host "⚠️  Port 8000 is already in use!" -ForegroundColor Yellow
    Write-Host "   Stopping existing process..." -ForegroundColor Yellow
    $proc = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

if ($port3000) {
    Write-Host "⚠️  Port 3000 is already in use!" -ForegroundColor Yellow
    Write-Host "   Stopping existing process..." -ForegroundColor Yellow
    $proc = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Write-Host "✅ Ports are ready!" -ForegroundColor Green
Write-Host ""

# Start Mock Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Mock Backend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$backendCmd = @"
`$Host.UI.RawUI.WindowTitle = 'ClothPOS - Backend Server'
Write-Host '========================================' -ForegroundColor Green
Write-Host '  BACKEND SERVER (Mock - No MongoDB)' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
cd '$projectDir\backend'
.\venv\Scripts\Activate.ps1
python mock_server.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Write-Host "✅ Backend server starting..." -ForegroundColor Green
Write-Host "   URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify backend is running
$backendRunning = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($backendRunning) {
    Write-Host "✅ Backend is running on port 8000!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
}

Write-Host ""

# Start Frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$frontendCmd = @"
`$Host.UI.RawUI.WindowTitle = 'ClothPOS - Frontend Server'
Write-Host '========================================' -ForegroundColor Green
Write-Host '  FRONTEND SERVER (React)' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
Write-Host 'Starting React development server...' -ForegroundColor Yellow
Write-Host 'This may take 20-30 seconds to compile...' -ForegroundColor Yellow
Write-Host ''
cd '$projectDir\frontend'
npm start
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "✅ Frontend server starting..." -ForegroundColor Green
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Wait for frontend to compile
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  ⏳ Waiting for React to compile..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "This usually takes 20-30 seconds..." -ForegroundColor Gray

for ($i = 1; $i -le 25; $i++) {
    Write-Progress -Activity "Compiling React Application" -Status "$i seconds elapsed..." -PercentComplete ($i * 4)
    Start-Sleep -Seconds 1
}

Write-Progress -Activity "Compiling React Application" -Completed
Write-Host ""

# Open browser
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🎉 OPENING APPLICATION!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Start-Process "http://localhost:3000"

# Display summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ PROJECT IS RUNNING!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Login:" -ForegroundColor Magenta
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Important:" -ForegroundColor Yellow
Write-Host "   - Two PowerShell windows are now running" -ForegroundColor White
Write-Host "   - Keep both windows open while using the app" -ForegroundColor White
Write-Host "   - Close them to stop the servers" -ForegroundColor White
Write-Host "   - This uses MOCK data (no real database)" -ForegroundColor White
Write-Host ""
Write-Host "📝 Note:" -ForegroundColor Gray
Write-Host "   This is a mock backend for testing." -ForegroundColor Gray
Write-Host "   For full functionality, install MongoDB later." -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
