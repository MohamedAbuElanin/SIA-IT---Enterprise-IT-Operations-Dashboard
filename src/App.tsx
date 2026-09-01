import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingSkeleton } from './components/ui/StateCard';
import { useAuthStore } from './store/useAuthStore';

const LoginPage = lazy(() => import('./pages/Login').then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.DashboardPage })));
const AssetsPage = lazy(() => import('./pages/Assets').then((module) => ({ default: module.AssetsPage })));
const InventoryPage = lazy(() => import('./pages/Inventory').then((module) => ({ default: module.InventoryPage })));
const MaintenancePage = lazy(() => import('./pages/Maintenance').then((module) => ({ default: module.MaintenancePage })));
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBase').then((module) => ({ default: module.KnowledgeBasePage })));
const LicensesPage = lazy(() => import('./pages/Licenses').then((module) => ({ default: module.LicensesPage })));
const NetworkPage = lazy(() => import('./pages/Network').then((module) => ({ default: module.NetworkPage })));
const ServersPage = lazy(() => import('./pages/Servers').then((module) => ({ default: module.ServersPage })));
const ReportsPage = lazy(() => import('./pages/Reports').then((module) => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/Settings').then((module) => ({ default: module.SettingsPage })));

const PageFallback: React.FC = () => (
  <div className="space-y-4 p-6">
    <LoadingSkeleton rows={2} />
    <LoadingSkeleton rows={5} />
  </div>
);

export const App: React.FC = () => {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="kb" element={<KnowledgeBasePage />} />
              <Route path="licenses" element={<LicensesPage />} />
              <Route path="network" element={<NetworkPage />} />
              <Route path="servers" element={<ServersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
