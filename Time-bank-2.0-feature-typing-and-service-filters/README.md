# TimeBank - Skill Exchange Platform

A modern web application for exchanging skills and services using a time-based credit system. Built with React, TypeScript, and Firebase.

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Firebase
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions, or follow the quick setup:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password Authentication and Firestore Database
3. Copy your Firebase config and create `.env.local` (or copy `.env.example` to `.env.local`) and fill values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Deploy Firestore Rules** (Important!):
```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Or use the helper script
.\deploy-rules.ps1   # Windows
# ./deploy-rules.sh  # Mac/Linux
```

**See [FIRESTORE_RULES_FIX.md](./FIRESTORE_RULES_FIX.md) if you get permission errors.**

5. Restart the dev server after adding/updating `.env.local` so Vite picks up the new variables.

Verify it worked:
- Open the browser console. You should see: `✅ Firebase initialized successfully`.
- If you see: `🏪 Firebase not configured, using local storage mode`, your `.env.local` is missing or has placeholders.

Security note:
- `.env.local` is git-ignored (see `.gitignore`), so your secrets won't be committed.

### 3. Run the App
```powershell
npm run dev
```

Open http://localhost:5173/ to view the app.

## 📱 Features

- **User Authentication** - Secure registration and login with Firebase Auth
- **Time-Based Credits** - Fair exchange system where 1 hour = 1 credit
- **Service Marketplace** - Browse and offer services across multiple categories
- **Booking System** - Schedule and manage service appointments
- **Wallet Management** - Track time credits, earnings, and spending
- **User Profiles** - Manage skills, bio, and reputation
- **Review System** - Rate and review service providers
- **Emergency SOS** - Safety feature with emergency contacts
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom animations

## 📂 Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Login/Register forms
│   ├── Dashboard/      # Main dashboard
│   ├── Services/       # Service marketplace
│   ├── Bookings/       # Booking management
│   ├── Wallet/         # Credit management
│   ├── Profile/        # User profiles
│   └── SOS/           # Emergency features
├── contexts/           # React contexts
├── hooks/             # Custom hooks
├── services/          # API services
├── types/             # TypeScript types
└── App.tsx           # Main app component
```

## 🔥 Development

```powershell
npm run dev        # Start development server
npm run build      # Build for production
npm run typecheck  # Run TypeScript checks
npm run lint       # Run ESLint
```
time-bank
