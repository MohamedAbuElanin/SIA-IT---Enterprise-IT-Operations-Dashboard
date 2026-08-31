import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  pulse = false,
  className,
}) => {
  const variants = {
    primary: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    danger: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
    info: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              variant === 'success' && 'bg-emerald-400',
              variant === 'danger' && 'bg-rose-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'primary' && 'bg-blue-400'
            )}
          ></span>
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'success' && 'bg-emerald-500',
              variant === 'danger' && 'bg-rose-500',
              variant === 'warning' && 'bg-amber-500',
              variant === 'primary' && 'bg-blue-500'
            )}
          ></span>
        </span>
      )}
      {children}
    </span>
  );
};
