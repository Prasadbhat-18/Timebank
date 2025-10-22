import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config is read from Vite env vars. Create a .env.local with VITE_FIREBASE_... values.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: show whether key env vars are present (do not print secret values)
if (import.meta.env.DEV) {
  console.log('Firebase env presence', {
    VITE_FIREBASE_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_PROJECT_ID: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  });
}

// Check if Firebase config is properly set and valid
export const isFirebaseConfigured = () => {
  const hasConfig = !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here' &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'your_project_id'
  );
  
  // Additional check for demo/fake credentials
  const isDemo = import.meta.env.VITE_FIREBASE_API_KEY?.includes('Demo') ||
                 import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('demo');
  
  return hasConfig && !isDemo;
};

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

// Only initialize Firebase if we have valid configuration
if (isFirebaseConfigured()) {
  try {
    // Avoid duplicate initialization during HMR by checking existing apps
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('\u2705 Firebase initialized successfully');
    } else {
      // reuse existing app instance
      app = getApps()[0];
      console.log('\u21bb Reusing existing Firebase app instance');
    }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  } catch (error) {
    console.warn('\u26a0\ufe0f Firebase initialization failed, using mock mode:', error);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.log('\ud83c\udfea Firebase not configured, using local storage mode');
}

export { auth, db, storage };
export default app;
