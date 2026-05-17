import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'neutral', className }: { 
  children: ReactNode; 
  variant?: 'neutral' | 'critical' | 'high' | 'medium' | 'low' | 'success';
  className?: string;
}) {
  const variants = {
    neutral: 'bg-zinc-100 text-zinc-600',
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
    success: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={cn(
      "inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
