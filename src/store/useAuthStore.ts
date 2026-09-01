// src/store/useAuthStore.ts
// Zustand store for Firebase Authentication state and operations.

import { create } from 'zustand';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

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

// Convert input username into deterministic internal Firebase email
export const resolveInternalEmail = (username: string): string => {
  const trimmed = username.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  return `${trimmed}@sia-it.local`;
};

// Map Firebase Auth error codes to user-friendly messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
      return 'اسم المستخدم أو كلمة المرور غير صحيحة (Invalid username or password)';
    case 'auth/too-many-requests':
      return 'تم حظر الحساب مؤقتاً لكثرة المحاولات الخاطئة. يرجى المحاولة لاحقاً (Too many failed attempts)';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بخدمة المصادقة. يرجى التحقق من اتصال الإنترنت (Network error)';
    case 'auth/user-disabled':
      return 'هذا الحساب معطل من قبل مسؤول النظام (Account disabled)';
    default:
      return 'فشلت عملية تسجيل الدخول. يرجى التحقق من صحة البيانات (Authentication failed)';
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  username: null,

  initAuth: () => {
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
  },

  login: async (usernameInput: string, passwordInput: string) => {
    set({ loading: true, error: null });
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
      await firebaseSignOut(auth);
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
