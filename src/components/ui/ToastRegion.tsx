import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useToastStore, type ToastTone } from '../../store/useToastStore';

const toastPresentation: Record<ToastTone, { icon: React.ReactNode; classes: string }> = {
  success: { icon: <CheckCircle2 className="w-5 h-5" />, classes: 'border-emerald-800 bg-emerald-950/90 text-emerald-300' },
  error: { icon: <XCircle className="w-5 h-5" />, classes: 'border-rose-800 bg-rose-950/90 text-rose-300' },
  warning: { icon: <TriangleAlert className="w-5 h-5" />, classes: 'border-amber-800 bg-amber-950/90 text-amber-300' },
  info: { icon: <Info className="w-5 h-5" />, classes: 'border-blue-800 bg-blue-950/90 text-blue-300' },
};

export const ToastRegion: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-3" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const presentation = toastPresentation[toast.tone];
          return (
            <motion.div key={toast.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className={`flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur ${presentation.classes}`}>
              <span className="shrink-0">{presentation.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-xs text-slate-300">{toast.description}</p>}
              </div>
              <button type="button" onClick={() => dismissToast(toast.id)} className="rounded p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white" aria-label={`Dismiss ${toast.title}`}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
