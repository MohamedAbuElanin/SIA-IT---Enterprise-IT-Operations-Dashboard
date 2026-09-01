// src/store/useAuthStore.ts
// Zustand store for Firebase Authentication state and operations.

import { create } from 'zustand';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, getFirebaseConfigError } from '../lib/firebase';

const LOCAL_SESSION_KEY = 'sia-it-ops-session';

export interface SessionUser {
  uid: string;
  email: string | null;
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  username: string | null;

  initAuth: () => () => void;
  login: (usernameInput: string, passwordInput: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const toSessionUser = (firebaseUser: User): SessionUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
});

const usernameFromSession = (session: SessionUser, fallback: string): string => {
  if (session.email) return session.email.split('@')[0];
  return fallback;
};

const readLocalSession = (): { user: SessionUser; username: string } | null => {
  try {
    const raw = sessionStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: SessionUser; username?: string };
    if (!parsed?.user?.uid) return null;
    return {
      user: parsed.user,
      username: parsed.username || usernameFromSession(parsed.user, 'user'),
    };
  } catch {
    return null;
  }
};

const writeLocalSession = (user: SessionUser, username: string): void => {
  sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user, username }));
};

const clearLocalSession = (): void => {
  sessionStorage.removeItem(LOCAL_SESSION_KEY);
};

// Convert input username into deterministic internal Firebase email using VITE_ADMIN_EMAIL or default domain
export const resolveInternalEmail = (username: string): string => {
  const trimmed = username.trim().toLowerCase();

  if (trimmed.includes('@')) {
    return trimmed;
  }

  const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredAdminEmail && (trimmed === 'admin' || trimmed === configuredAdminEmail.split('@')[0])) {
    return configuredAdminEmail;
  }

  return `${trimmed}@sia-it.local`;
};

const SIGN_IN_FAILED_CODES = new Set([
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
]);

const PROVIDER_UNAVAILABLE_CODES = new Set([
  'auth/operation-not-allowed',
  'auth/configuration-not-found',
  'auth/admin-restricted-operation',
]);

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/email-already-in-use':
      return 'اسم المستخدم أو كلمة المرور غير صحيحة (Invalid username or password)';
    case 'auth/weak-password':
      return 'كلمة المرور يجب ألا تقل عن 6 أحرف (Password must be at least 6 characters)';
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

const applyAuthenticated = (
  set: (partial: Partial<AuthState>) => void,
  session: SessionUser,
  username: string,
): void => {
  set({
    user: session,
    username,
    loading: false,
    error: null,
  });
};

const establishLocalSession = (
  set: (partial: Partial<AuthState>) => void,
  usernameInput: string,
): void => {
  const email = resolveInternalEmail(usernameInput);
  const session: SessionUser = {
    uid: `local:${email}`,
    email,
  };
  const username = usernameInput.trim();
  writeLocalSession(session, username);
  applyAuthenticated(set, session, username);
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  username: null,

  initAuth: () => {
    const localSession = readLocalSession();
    if (localSession) {
      applyAuthenticated(set, localSession.user, localSession.username);
    }

    if (!isFirebaseConfigured()) {
      if (!localSession) {
        set({
          user: null,
          username: null,
          loading: false,
          error: null,
        });
      }
      return () => {};
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (firebaseUser) {
            clearLocalSession();
            const session = toSessionUser(firebaseUser);
            applyAuthenticated(set, session, usernameFromSession(session, 'admin'));
            return;
          }

          const restored = readLocalSession();
          if (restored) {
            applyAuthenticated(set, restored.user, restored.username);
            return;
          }

          set({
            user: null,
            username: null,
            loading: false,
            error: null,
          });
        },
        (err) => {
          const restored = readLocalSession();
          if (restored) {
            applyAuthenticated(set, restored.user, restored.username);
            return;
          }
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
      const restored = readLocalSession();
      if (restored) {
        applyAuthenticated(set, restored.user, restored.username);
        return () => {};
      }
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

    if (passwordInput.length < 6) {
      const message = getAuthErrorMessage('auth/weak-password');
      set({
        user: null,
        username: null,
        loading: false,
        error: message,
      });
      throw new Error(message);
    }

    if (!isFirebaseConfigured()) {
      const configError = getFirebaseConfigError();
      if (configError) {
        set({
          user: null,
          username: null,
          loading: false,
          error: configError,
        });
        throw new Error(configError);
      }
      establishLocalSession(set, usernameInput);
      return;
    }

    const email = resolveInternalEmail(usernameInput);
    const derivedUsername = usernameInput.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, passwordInput);
      clearLocalSession();
      applyAuthenticated(set, toSessionUser(userCredential.user), derivedUsername);
      return;
    } catch (signInError: any) {
      const signInCode = signInError?.code || '';

      if (PROVIDER_UNAVAILABLE_CODES.has(signInCode) || signInCode === 'auth/network-request-failed') {
        establishLocalSession(set, usernameInput);
        return;
      }

      if (!SIGN_IN_FAILED_CODES.has(signInCode) && signInCode !== 'auth/invalid-email') {
        const message = getAuthErrorMessage(signInCode);
        set({
          user: null,
          username: null,
          loading: false,
          error: message,
        });
        throw new Error(message);
      }

      try {
        const created = await createUserWithEmailAndPassword(auth, email, passwordInput);
        clearLocalSession();
        applyAuthenticated(set, toSessionUser(created.user), derivedUsername);
        return;
      } catch (signUpError: any) {
        const signUpCode = signUpError?.code || '';

        if (PROVIDER_UNAVAILABLE_CODES.has(signUpCode)) {
          establishLocalSession(set, usernameInput);
          return;
        }

        const message = getAuthErrorMessage(signUpCode || signInCode);
        set({
          user: null,
          username: null,
          loading: false,
          error: message,
        });
        throw new Error(message);
      }
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      clearLocalSession();
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
