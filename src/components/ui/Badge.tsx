import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'neutral', className }: { 
  children: ReactNode; 
  variant?: 'neutral' | 'critical' | 'high' | 'medium' | 'low' | 'success';
  className?: string;
}) {
  const variants = {
    neutral: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full inline-block",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
