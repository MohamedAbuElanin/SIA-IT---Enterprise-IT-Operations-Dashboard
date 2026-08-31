import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  change,
  changeType = 'neutral',
  icon,
  variant = 'primary',
}) => {
  const iconBg = {
    primary: 'bg-blue-600/10 text-blue-400 border border-blue-500/20',
    success: 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-600/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-600/10 text-rose-400 border border-rose-500/20',
    neutral: 'bg-slate-800 text-slate-400 border border-slate-700',
  };

  return (
    <Card hoverEffect className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-2 tracking-tight">{value}</h3>

          {(change || subtext) && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              {change && (
                <span
                  className={cn(
                    'font-medium px-1.5 py-0.5 rounded',
                    changeType === 'positive' && 'bg-emerald-950 text-emerald-400',
                    changeType === 'negative' && 'bg-rose-950 text-rose-400',
                    changeType === 'neutral' && 'bg-slate-800 text-slate-400'
                  )}
                >
                  {change}
                </span>
              )}
              {subtext && <span className="text-slate-400">{subtext}</span>}
            </div>
          )}
        </div>

        <div className={cn('p-3 rounded-xl transition-transform duration-200 group-hover:scale-110', iconBg[variant])}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
