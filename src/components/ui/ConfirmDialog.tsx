import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'warning' | 'danger' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
}) => {
  const iconColor = {
    warning: 'text-amber-400',
    danger: 'text-rose-400',
    info: 'text-blue-400',
  }[variant];

  const bgColor = {
    warning: 'bg-amber-500/10 border-amber-500/30',
    danger: 'bg-rose-500/10 border-rose-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  }[variant];

  const confirmVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${bgColor}`}>
                <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <h3 className="text-base font-bold text-slate-100 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 pb-5 pt-2 border-t border-slate-800/60 mt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={confirmVariant as 'primary' | 'danger'}
                size="sm"
                onClick={() => { onConfirm(); onClose(); }}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
