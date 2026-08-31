import React from 'react';
import { SlideDrawer } from '../ui/SlideDrawer';
import { useNotificationStore } from '../../store/useNotificationStore';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCheck, Trash2, BellOff } from 'lucide-react';
import { Button } from '../ui/Button';

export const NotificationsDrawer: React.FC = () => {
  const { alerts, isOpen, setIsOpen, markAsRead, markAllAsRead, clearAlert } = useNotificationStore();

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="مركز تنبيهات وأحداث النظام (Alert Center)"
      subtitle="سجل حوادث البنية التحتية والعمليات الفورية"
    >
      <div className="space-y-4">
        {/* Actions header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs text-slate-400 font-medium">
            {alerts.filter((a) => !a.read).length} تنبيه غير مقروء
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            icon={<CheckCheck className="w-4 h-4 text-blue-400" />}
          >
            تحديد الكل كمقروء
          </Button>
        </div>

        {/* Alerts list */}
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => markAsRead(alert.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  alert.read
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                    : 'bg-slate-900 border-slate-700/80 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <StatusBadge status={alert.severity} />
                  <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                </div>

                <h4 className="text-sm font-semibold text-slate-100">{alert.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/40 text-xs">
                  <span className="text-[10px] text-blue-400 font-mono uppercase font-semibold">وحدة: {alert.sourceModule}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAlert(alert.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="حذف التنبيه"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <BellOff className="w-10 h-10 text-slate-700" />
            <p className="text-sm">لا توجد تنبيهات نشطة في الوقت الحالي.</p>
          </div>
        )}
      </div>
    </SlideDrawer>
  );
};

