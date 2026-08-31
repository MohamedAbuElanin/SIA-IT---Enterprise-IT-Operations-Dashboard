import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
    <Inbox className="mb-3 h-8 w-8 text-slate-500" />
    <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
    <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = 'Unable to load this section', description = 'Please retry the operation.', onRetry }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-rose-900/60 bg-rose-950/20 p-6 text-center">
    <AlertCircle className="mb-3 h-8 w-8 text-rose-400" />
    <h3 className="text-sm font-semibold text-rose-200">{title}</h3>
    <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p>
    {onRetry && <Button className="mt-4" variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
  </div>
);

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="animate-pulse space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5" aria-label="Loading content">
    <div className="h-4 w-1/3 rounded bg-slate-800" />
    {Array.from({ length: rows }, (_, index) => <div key={index} className="h-11 rounded-lg bg-slate-800/70" />)}
  </div>
);
