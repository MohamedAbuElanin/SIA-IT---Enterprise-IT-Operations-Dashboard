// src/store/useAuthStore.ts
// Zustand store for Firebase Authentication state and operations.

import { create } from 'zustand';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, getFirebaseConfigError } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  username: string | null;

  initAuth: () => () => void;
  login: (usernameInput: string, passwordInput: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Convert input username into deterministic internal Firebase email using VITE_ADMIN_EMAIL or default domain
export const resolveInternalEmail = (username: string): string => {
  const trimmed = username.trim().toLowerCase();
  
  // If user already typed a full email, use it directly
  if (trimmed.includes('@')) {
    return trimmed;
  }

  // If VITE_ADMIN_EMAIL is defined and user typed 'admin' (or matches the admin alias), use the configured admin email
  const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredAdminEmail && (trimmed === 'admin' || trimmed === configuredAdminEmail.split('@')[0])) {
    return configuredAdminEmail;
  }

  // Default deterministic internal email for standard usernames
  return `${trimmed}@sia-it.local`;
};

// Map Firebase Auth error codes to user-friendly Arabic/English messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'اسم المستخدم أو كلمة المرور غير صحيحة (Invalid username or password)';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني أو اسم المستخدم غير صالحة (Invalid email/username format)';
    case 'auth/too-many-requests':
      return 'تم حظر تسجيل الدخول مؤقتاً لكثرة المحاولات الخاطئة. يرجى المحاولة بعد قليل (Too many failed attempts)';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بخدمة Firebase. يرجى التحقق من اتصال الإنترنت (Network error)';
    case 'auth/user-disabled':
      return 'هذا الحساب معطل من قبل مسؤول النظام (Account disabled)';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'مفتاح Firebase API Key غير صالح. يرجى مراجعة إعدادات .env (Invalid Firebase API Key)';
    case 'auth/app-deleted':
    case 'auth/app-not-authorized':
      return 'تطبيق Firebase غير مصرح له بتسجيل الدخول من هذا النطاق (App not authorized)';
    default:
      return 'فشلت عملية تسجيل الدخول. يرجى التحقق من صحة البيانات وإعدادات النظام (Authentication failed)';
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  username: null,

  initAuth: () => {
    // If Firebase is not configured, finish loading state immediately to show login screen with warning
    if (!isFirebaseConfigured()) {
      set({
        user: null,
        username: null,
        loading: false,
        error: null,
      });
      return () => {};
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (firebaseUser) {
            const derivedUsername = firebaseUser.email
              ? firebaseUser.email.split('@')[0]
              : 'admin';
            set({
              user: firebaseUser,
              username: derivedUsername,
              loading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              username: null,
              loading: false,
              error: null,
            });
          }
        },
        (err) => {
          set({
            user: null,
            username: null,
            loading: false,
            error: err.message,
          });
        }
      );
      return unsubscribe;
    } catch (err: any) {
      set({
        user: null,
        username: null,
        loading: false,
        error: err?.message || 'Failed to initialize authentication',
      });
      return () => {};
    }
  },

  login: async (usernameInput: string, passwordInput: string) => {
    set({ loading: true, error: null });

    // Guard: Prevent sending requests with placeholder or missing Firebase credentials
    if (!isFirebaseConfigured()) {
      const configError = getFirebaseConfigError() || 'Firebase credentials are not configured in .env';
      set({
        user: null,
        username: null,
        loading: false,
        error: configError,
      });
      throw new Error(configError);
    }

    try {
      const email = resolveInternalEmail(usernameInput);
      const userCredential = await signInWithEmailAndPassword(auth, email, passwordInput);
      const derivedUsername = userCredential.user.email
        ? userCredential.user.email.split('@')[0]
        : usernameInput;

      set({
        user: userCredential.user,
        username: derivedUsername,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      const message = getAuthErrorMessage(err?.code || '');
      set({
        user: null,
        username: null,
        loading: false,
        error: message,
      });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      if (isFirebaseConfigured()) {
        await firebaseSignOut(auth);
      }
      set({
        user: null,
        username: null,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
