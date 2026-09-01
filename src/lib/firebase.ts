// src/lib/firebase.ts
// Robust Firebase initialization with environment variable validation.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Public web SDK config for project sia-it-1 (same values Firebase Hosting
 * exposes at /__/firebase/init.json). These are client-safe identifiers;
 * security is enforced by Auth, Firestore rules, and authorized domains.
 */
const SIA_IT_FIREBASE_DEFAULTS = {
  apiKey: 'AIzaSyBOUfL--S9z1NO8iCFHal0XGbVcsIE2CrU',
  authDomain: 'sia-it-1.firebaseapp.com',
  projectId: 'sia-it-1',
  storageBucket: 'sia-it-1.firebasestorage.app',
  messagingSenderId: '312111252930',
  appId: '',
} as const;

const envOrDefault = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const apiKey = envOrDefault(import.meta.env.VITE_FIREBASE_API_KEY, SIA_IT_FIREBASE_DEFAULTS.apiKey);
const authDomain = envOrDefault(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, SIA_IT_FIREBASE_DEFAULTS.authDomain);
const projectId = envOrDefault(import.meta.env.VITE_FIREBASE_PROJECT_ID, SIA_IT_FIREBASE_DEFAULTS.projectId);
const storageBucket = envOrDefault(
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  SIA_IT_FIREBASE_DEFAULTS.storageBucket
);
const messagingSenderId = envOrDefault(
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  SIA_IT_FIREBASE_DEFAULTS.messagingSenderId
);
const appId = envOrDefault(import.meta.env.VITE_FIREBASE_APP_ID, SIA_IT_FIREBASE_DEFAULTS.appId);

// Helper to detect if a value is unset or still contains template placeholders
export const isPlaceholderValue = (val?: string): boolean => {
  if (!val) return true;
  const trimmed = val.trim();
  return (
    trimmed === '' ||
    trimmed.includes('YOUR_') ||
    trimmed.includes('_HERE') ||
    trimmed.includes('PLACEHOLDER') ||
    trimmed === 'dummy-api-key' ||
    (trimmed.startsWith('<') && trimmed.endsWith('>'))
  );
};

export const isFirebaseConfigured = (): boolean => {
  return (
    !isPlaceholderValue(apiKey) &&
    !isPlaceholderValue(projectId) &&
    !isPlaceholderValue(authDomain) &&
    apiKey.startsWith('AIza')
  );
};

export const getFirebaseConfigError = (): string | null => {
  if (!isFirebaseConfigured()) {
    return 'إعدادات Firebase غير متوفرة. يرجى ضبط متغيرات VITE_FIREBASE_* في ملف .env (Firebase configuration is missing. Please configure the required VITE_FIREBASE_* environment variables).';
  }
  return null;
};

const firebaseConfig: Record<string, string> = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
};

if (!isPlaceholderValue(appId)) {
  firebaseConfig.appId = appId;
}

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
