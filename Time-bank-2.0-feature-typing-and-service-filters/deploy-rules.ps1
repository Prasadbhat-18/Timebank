# Firestore Rules Deployment Script
# Run this after installing Firebase CLI: npm install -g firebase-tools

Write-Host "🔥 Deploying Firestore Rules..." -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
try {
    $version = firebase --version
    Write-Host "✅ Firebase CLI installed: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host ""
Write-Host "Checking Firebase login status..." -ForegroundColor Cyan
$loginCheck = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Firebase" -ForegroundColor Red
    Write-Host "Running: firebase login" -ForegroundColor Yellow
    firebase login
}

# Deploy rules
Write-Host ""
Write-Host "Deploying Firestore rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Firestore rules deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Refresh your app at http://localhost:5174/" -ForegroundColor White
    Write-Host "2. Check browser console - no more permission errors!" -ForegroundColor White
    Write-Host "3. Test: View services, create bookings, send chat messages" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Try: firebase deploy --only firestore:rules --debug" -ForegroundColor Yellow
}
