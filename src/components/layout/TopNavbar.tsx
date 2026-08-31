import React, { useEffect } from 'react';
import { Bell, Search, Command } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { useUiStore } from '../../store/useUiStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export const TopNavbar: React.FC = () => {
  const { toggleCommandPalette, activeRole } = useUiStore();
  const { unreadCount, toggleOpen } = useNotificationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Right Breadcrumb & System Context in RTL */}
      <div className="flex flex-col">
        <Breadcrumb />
      </div>

      {/* Left Navbar Controls in RTL */}
      <div className="flex items-center gap-4">
        {/* Command Palette Trigger Button */}
        <button
          onClick={toggleCommandPalette}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-slate-400 text-xs transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>البحث السريع في النظام...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Real-time System Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-800/50 rounded-full text-xs text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold font-mono text-[11px]">All Systems Operational</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={toggleOpen}
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="مركز التنبيهات والإشعارات"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Role Badge */}
        <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-800">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-200 max-w-[200px] truncate">{activeRole}</p>
            <p className="text-[10px] text-slate-500 font-mono">HQ Logistics Hub</p>
          </div>
        </div>
      </div>
    </header>
  );
};
