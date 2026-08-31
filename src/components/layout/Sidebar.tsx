import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  HardDrive,
  Boxes,
  Wrench,
  BookOpen,
  KeyRound,
  Network,
  Server,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useUiStore } from '../../store/useUiStore';
import { cn } from '../../utils/cn';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Assets', path: '/assets', icon: HardDrive },
  { name: 'Inventory', path: '/inventory', icon: Boxes },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Knowledge Base', path: '/kb', icon: BookOpen },
  { name: 'Licenses', path: '/licenses', icon: KeyRound },
  { name: 'Network', path: '/network', icon: Network },
  { name: 'Servers', path: '/servers', icon: Server },
  { name: 'Reports', path: '/reports', icon: FileBarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        'fixed top-0 right-0 z-40 h-screen bg-slate-900 border-l border-slate-800 transition-all duration-300 flex flex-col justify-between select-none',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className={cn('flex items-center gap-3 overflow-hidden transition-all', isSidebarCollapsed && 'justify-center w-full')}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 shrink-0 font-bold">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 tracking-tight leading-tight">SIA IT Ops</span>
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold font-mono">Enterprise Telemetry</span>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            title="طي القائمة الجانبية"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse Toggle Button (When Collapsed) */}
      {isSidebarCollapsed && (
        <div className="px-3 pt-2">
          <button
            onClick={toggleSidebar}
            title="توسيع القائمة الجانبية"
            className="w-full p-2 flex justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                  isSidebarCollapsed && 'justify-center px-0'
                )
              }
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              {!isSidebarCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!isSidebarCollapsed && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">SIA AutoParts IT</span>
            <span className="font-mono text-[10px] text-slate-500">v2.4.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">HQ Logistics Backbone</p>
        </div>
      )}
    </aside>
  );
};
