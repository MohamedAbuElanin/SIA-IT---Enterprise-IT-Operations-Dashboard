import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const widthClass = (value: number) => {
  const rounded = Math.min(100, Math.max(0, Math.round(value / 5) * 5));
  return `progress-${rounded}`;
};

const toneClass = {
  primary: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, tone = 'primary', className }) => (
  <div className={cn('progress-track', className)} aria-label={`${Math.round(value)}% complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
    <div className={cn('progress-value', widthClass(value), toneClass[tone])} />
  </div>
);
