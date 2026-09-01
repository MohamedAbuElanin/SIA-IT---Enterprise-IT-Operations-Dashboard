// src/components/auth/ProtectedRoute.tsx
// Route guard that checks Firebase Authentication state before rendering protected pages.

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  // If Firebase Auth is still verifying the session token on app load, show a sleek splash screen to avoid flicker
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center space-y-4 max-w-sm w-full text-center">
          {/* Logo Badge */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">SIA IT Operations</h2>
            <p className="text-xs text-slate-400 font-mono">Verifying secure enterprise session...</p>
          </div>

          <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: Redirect to /login and preserve requested path in location state
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated: Render protected dashboard layout & child routes
  return <Outlet />;
};
