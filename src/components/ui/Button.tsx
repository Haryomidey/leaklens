import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900 shadow-sm',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200',
    outline: 'bg-transparent text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-500 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-md',
    md: 'px-4 py-2 text-sm font-semibold rounded-lg',
    lg: 'px-6 py-3 text-base font-semibold rounded-lg',
    icon: 'p-2 rounded-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-center leading-none transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
