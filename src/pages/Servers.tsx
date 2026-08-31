import React, { useState } from 'react';
import { Terminal, RotateCcw, Server } from 'lucide-react';
import { useServerStore } from '../store/useServerStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { useToastStore } from '../store/useToastStore';

export const ServersPage: React.FC = () => {
  const { servers, selectedServer, setSelectedServer, rebootServer, logs } = useServerStore();
  const { addToast } = useToastStore();
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');

  const filteredLogs = logs.filter((log) => logFilter === 'ALL' || log.level === logFilter);

  const handleReboot = (id: string, name: string) => {
    rebootServer(id);
    addToast({ tone: 'warning', title: 'إعادة تشغيل الخادم', description: `تم إرسال أمر إعادة التشغيل لـ ${name}` });
  };

  return (
    <div className="space-y-6 text-right">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">إدارة السيرفرات والمخدمات الافتراضية (Servers & VM Clusters)</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            المراقبة الفورية لمجموعات قواعد بيانات ERP، مخدمات نظام WMS للمستودعات، وبوابات تبادل البيانات EDI
          </p>
        </div>
      </div>

      {/* Servers Cards Grid */}
      {servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((srv) => {
            const isSelected = selectedServer?.id === srv.id;
            return (
              <Card
                key={srv.id}
                onClick={() => setSelectedServer(srv)}
                className={`p-5 cursor-pointer transition-all text-right ${
                  isSelected ? 'border-blue-500 bg-blue-950/20 shadow-blue-950/40' : 'hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{srv.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{srv.ipAddress}</p>
                  </div>
                  <StatusBadge status={srv.status} />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs mb-4">
                  <span className="text-slate-500 block mb-0.5">الدور التشغيلي (Role)</span>
                  <span className="font-semibold text-slate-200">{srv.role}</span>
                </div>

                {/* Resource Bars */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">استهلاك المعالج (CPU)</span>
                      <span className={`font-bold font-mono ${srv.cpuUsagePct > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {srv.cpuUsagePct}%
                      </span>
                    </div>
                    <ProgressBar value={srv.cpuUsagePct} tone={srv.cpuUsagePct > 80 ? 'danger' : 'primary'} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">استهلاك الذاكرة (RAM)</span>
                      <span className={`font-bold font-mono ${srv.ramUsagePct > 85 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {srv.ramUsagePct}%
                      </span>
                    </div>
                    <ProgressBar value={srv.ramUsagePct} tone={srv.ramUsagePct > 85 ? 'warning' : 'success'} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>مدة الجاهزية Uptime: <strong className="text-slate-200 font-mono">{srv.uptimeDays} يوم</strong></span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReboot(srv.id, srv.name);
                    }}
                    icon={<RotateCcw className="w-3.5 h-3.5 text-rose-400" />}
                  >
                    إعادة تشغيل (Reboot)
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-500 space-y-3">
          <Server className="w-12 h-12 mx-auto opacity-30 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-300">لا توجد خوادم مسجلة في النظام</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ستظهر هنا خوادم قواعد البيانات، المخدمات الافتراضية Hyper-V، وتطبيقات WMS فور تهيئتها وإضافتها.
          </p>
        </Card>
      )}

      {/* Live System Console Logs Viewer */}
      <Card className="p-6 space-y-4 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">سجل الأحداث المباشر لوحدة التحكم (Live System Console Stream)</h3>
              <p className="text-xs text-slate-400">سجل الأحداث الفوري عبر عقد ERP وWMS وHyper-V والمخدمات الرئيسية</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {([
              { key: 'ALL', label: 'كافة السجلات' },
              { key: 'INFO', label: 'معلومات INFO' },
              { key: 'WARN', label: 'تحذيرات WARN' },
              { key: 'ERROR', label: 'أخطاء ERROR' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setLogFilter(key)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  logFilter === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Box */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2 max-h-64 overflow-y-auto dir-ltr text-left">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    log.level === 'ERROR'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : log.level === 'WARN'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-slate-300 leading-relaxed font-mono">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-600 text-center py-6">
              Console stream initialized. No active events logged.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
