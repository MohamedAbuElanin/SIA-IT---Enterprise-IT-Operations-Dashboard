// src/lib/firebase.ts
// Robust Firebase initialization with environment variable validation.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Helper to detect if a value is unset or still contains template placeholders
export const isPlaceholderValue = (val?: string): boolean => {
  if (!val) return true;
  const trimmed = val.trim();
  return (
    trimmed === '' ||
    trimmed.includes('YOUR_') ||
    trimmed.includes('_HERE') ||
    trimmed.includes('PLACEHOLDER') ||
    (trimmed.startsWith('<') && trimmed.endsWith('>'))
  );
};

export const isFirebaseConfigured = (): boolean => {
  return (
    !isPlaceholderValue(apiKey) &&
    !isPlaceholderValue(projectId) &&
    !isPlaceholderValue(authDomain) &&
    !isPlaceholderValue(appId)
  );
};

export const getFirebaseConfigError = (): string | null => {
  if (!isFirebaseConfigured()) {
    return 'إعدادات Firebase غير متوفرة. يرجى ضبط متغيرات VITE_FIREBASE_* في ملف .env (Firebase configuration is missing. Please configure the required VITE_FIREBASE_* environment variables).';
  }
  return null;
};

const firebaseConfig = {
  apiKey: apiKey || 'dummy-api-key',
  authDomain: authDomain || 'sia-it-1.firebaseapp.com',
  projectId: projectId || 'sia-it-1',
  storageBucket: storageBucket || 'sia-it-1.appspot.com',
  messagingSenderId: messagingSenderId || '000000000000',
  appId: appId || '1:000000000000:web:000000000000',
};

// Idempotent initialization
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export default app;
