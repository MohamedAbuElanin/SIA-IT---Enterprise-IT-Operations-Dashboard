import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverEffect = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 shadow-lg transition-all duration-200',
        hoverEffect && 'hover:border-slate-700 hover:shadow-slate-900/50 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
