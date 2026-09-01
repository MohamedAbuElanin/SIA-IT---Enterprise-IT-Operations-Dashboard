// src/pages/Login.tsx
// Professional enterprise login screen for SIA IT Operations Dashboard.

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  Server,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { getFirebaseConfigError } from '../lib/firebase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading, error, clearError } = useAuthStore();
  const { addToast } = useToastStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(getFirebaseConfigError());

  // If already authenticated, redirect to dashboard or intended route
  useEffect(() => {
    if (user && !authLoading) {
      const origin = (location.state as any)?.from?.pathname || '/';
      navigate(origin, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setValidationError('يرجى إدخال اسم المستخدم (Username is required)');
      return;
    }

    if (!password) {
      setValidationError('يرجى إدخال كلمة المرور (Password is required)');
      return;
    }

    if (password.length < 6) {
      setValidationError('كلمة المرور يجب ألا تقل عن 6 أحرف (Password must be at least 6 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedUsername, password);
      addToast({
        tone: 'success',
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك في نظام SIA IT Operations Dashboard',
      });
      const destination = (location.state as any)?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err: any) {
      // Error is stored in useAuthStore and rendered in the alert box
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none" dir="rtl">
      {/* Background ambient glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg tracking-tight">SIA IT Operations</h1>
            <p className="text-[11px] text-blue-400 font-mono font-medium">Enterprise Telemetry & Asset Management</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-slate-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Gateway v2.4.0</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/60 relative">
          {/* Card Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">تسجيل الدخول إلى المنظومة</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              يرجى إدخال بيانات الاعتماد المعتمدة للوصول إلى لوحة التحكم والعمليات.
            </p>
          </div>

          {/* Validation or Auth Error Alert */}
          {(validationError || error) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-start gap-3 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 text-right">
                <span className="font-semibold block leading-relaxed">{validationError || error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right font-mono">
                اسم المستخدم / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder=""
                  autoComplete="off"
                  name="sia-username"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all disabled:opacity-50"
                  dir="ltr"
                />
                <User className="w-4 h-4 text-slate-500 absolute top-3 right-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right font-mono">
                كلمة المرور / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder=""
                  autoComplete="new-password"
                  name="sia-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all disabled:opacity-50"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute top-3 right-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 left-3 p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري التحقق والمصادقة...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول للنظام (Sign In)</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer inside card */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500/70" />
              <span>مخصص للاستخدام المصرح به من قبل فريق تقنية المعلومات فقط.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 z-10 gap-2">
        <span>© {new Date().getFullYear()} SIA AutoParts Enterprise IT Infrastructure</span>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-400" /> Firebase Secured
          </span>
          <span>•</span>
          <span>High-Security Zone</span>
        </div>
      </footer>
    </div>
  );
};
