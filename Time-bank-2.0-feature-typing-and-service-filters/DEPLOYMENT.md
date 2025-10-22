# Deploying to Netlify

This project uses Vite + React. Netlify needs only a build command and the dist folder. Env variables must be configured in Netlify because `.env` files are not used during deploy (and should not contain secrets).

## 1) Netlify settings
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18 (set in `netlify.toml`)

## 2) Environment variables (Site settings > Build & deploy > Environment)
Set the following variables (copy from your local `.env.local`):

Required
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_CLOUDINARY_UPLOAD_PRESET
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Optional
- VITE_SERVER_URL

Do NOT set secrets like API secrets in Vite env variables. They are exposed to the client.

## 3) Remove secrets from .env in repo
If `.env` currently contains secrets, remove them and use `.env.local` (git-ignored) for local dev. Push-safe file: `.env.example` with placeholders.

## 4) Redeploy
After setting env vars in Netlify, trigger a new deploy.

## 5) Google Sign-In on Netlify
To make Google login work on your deployed site, configure Firebase Authentication properly:

1. In Firebase Console → Authentication → Sign-in method → Google, ensure Google is Enabled.
2. In Firebase Console → Authentication → Settings → Authorized domains, add ALL of the following:
	- Your production Netlify domain (e.g. `your-site.netlify.app` or custom domain)
	- `localhost` (for local testing)
	- Any deploy preview domains you use (optional)
3. If you use redirect-based sign-in (used as a fallback when popups are blocked), ensure the authorized domain list above includes the deployed domain. Vite apps generally work with the domain-level allowlist; custom redirect URIs are not required.
4. If popups are blocked (common in Safari/iOS), the app automatically falls back to redirect. After redirect, the app will resume and complete sign-in.
5. If you still see errors:
	- Check the browser console for `auth/popup-blocked`, `auth/operation-not-allowed`, or domain errors.
	- Verify env vars are present at runtime: open the devtools and check the console for the "Firebase env presence" log in development.
	- Confirm that your Firebase project matches the env values you configured.
