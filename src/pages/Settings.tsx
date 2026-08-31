import React from 'react';
import { Moon, RefreshCw, Shield, Sun, Check } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../store/useToastStore';

export const SettingsPage: React.FC = () => {
  const { activeRole, setActiveRole, theme, setTheme } = useUiStore();
  const { addToast } = useToastStore();

  return (
    <div className="space-y-6 max-w-4xl text-right">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">System Settings & Preferences</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          تخصيص صلاحيات المستخدمين، عتبات التنبيهات، ومعدلات استقصاء البيانات الفورية
        </p>
      </div>

      {/* Role Switcher Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-base font-bold text-slate-100">Active User Role Preview</h3>
            <p className="text-xs text-slate-400">Switch permission context for interface access testing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { role: 'IT Senior Architect' as const, desc: 'Full admin access across servers, VPNs, assets & all configurations' },
            { role: 'Tier 2 Support Lead' as const, desc: 'Maintenance tickets, scanner configuration, device management' },
            { role: 'Warehouse IT Specialist' as const, desc: 'Stock inventory tracking and device tag audit only' },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => { setActiveRole(item.role); addToast({ tone: 'success', title: 'Role Updated', description: `${item.role} permissions are now active.` }); }}
              className={`p-4 rounded-xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                activeRole === item.role
                  ? 'bg-blue-950/40 border-blue-500 text-slate-100 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-200 font-mono">{item.role}</span>
                {activeRole === item.role && <Check className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <div>
            <h3 className="text-base font-bold text-slate-100">Appearance</h3>
            <p className="text-xs text-slate-400">Choose interface theme for the current browser session.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'dark' as const, label: 'Dark Mode', icon: <Moon className="w-4 h-4" /> },
            { id: 'light' as const, label: 'Light Mode', icon: <Sun className="w-4 h-4" /> }
          ].map((option) => (
            <Button key={option.id} variant={theme === option.id ? 'primary' : 'outline'} onClick={() => { setTheme(option.id); addToast({ tone: 'info', title: 'Theme Updated', description: `${option.label} is now active.` }); }} icon={option.icon}>
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Telemetry Refresh & Alert Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <RefreshCw className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-slate-100">Telemetry & Notification Preferences</h3>
            <p className="text-xs text-slate-400">Adjust polling frequency and alert threshold triggers</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Server Telemetry Polling Rate</span>
              <span className="text-xs text-slate-400">Controls CPU/RAM graph sample interval across production nodes</span>
            </div>
            <select className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none font-mono">
              <option value="10">10s — Real-time</option>
              <option value="30">30s — Balanced</option>
              <option value="60">60s — Low Load</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">IPsec VPN Latency Alert</span>
              <span className="text-xs text-slate-400">Send critical alert when tunnel ping latency exceeds 50ms</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 rounded cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Warehouse Scanner Reorder Threshold</span>
              <span className="text-xs text-slate-400">Trigger alert when spare scanner stock drops below 5 units</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 rounded cursor-pointer" />
          </div>
        </div>
      </Card>
    </div>
  );
};
