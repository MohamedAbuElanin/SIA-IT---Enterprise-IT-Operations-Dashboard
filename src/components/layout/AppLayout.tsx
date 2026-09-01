import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CommandPalette } from './CommandPalette';
import { NotificationsDrawer } from './NotificationsDrawer';
import { useUiStore } from '../../store/useUiStore';
import { cn } from '../../utils/cn';
import { ToastRegion } from '../ui/ToastRegion';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useFirestoreSubscriptions } from '../../hooks/useFirestoreSubscriptions';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed, theme } = useUiStore();
  const { toggleSidebar } = useUiStore();
  const location = useLocation();
  useKeyboardShortcut('b', toggleSidebar, { ctrlOrMeta: true });
  useFirestoreSubscriptions();

  return (
    <div className={cn('min-h-screen bg-[#0F172A] text-slate-100 flex flex-col', `theme-${theme}`)}>
      {/* Fixed Collapsible Sidebar */}
      <Sidebar />

      {/* Main Container area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          isSidebarCollapsed ? 'pr-20 pl-0' : 'pr-64 pl-0'
        )}
      >
        {/* Sticky Top Navbar */}
        <TopNavbar />

        {/* Page Main Content Area */}
        <motion.main key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="flex-1 p-6 space-y-6 max-w-[1700px] w-full mx-auto">
          <Outlet />
        </motion.main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPalette />
      <NotificationsDrawer />
      <ToastRegion />
    </div>
  );
};

