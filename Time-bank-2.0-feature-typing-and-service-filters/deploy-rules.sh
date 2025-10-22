#!/bin/bash
# Firestore Rules Deployment Script
# Run this after installing Firebase CLI: npm install -g firebase-tools

echo "🔥 Deploying Firestore Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI installed: $(firebase --version)"

# Check if logged in
echo ""
echo "Checking Firebase login status..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase"
    echo "Running: firebase login"
    firebase login
fi

# Deploy rules
echo ""
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Refresh your app at http://localhost:5174/"
    echo "2. Check browser console - no more permission errors!"
    echo "3. Test: View services, create bookings, send chat messages"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Try: firebase deploy --only firestore:rules --debug"
    exit 1
fi
