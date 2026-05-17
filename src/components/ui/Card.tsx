import {ComponentPropsWithoutRef} from 'react';
import { cn } from '../../lib/utils';

type CardProps = ComponentPropsWithoutRef<'div'>;

export function Card({children, className, ...props}: CardProps) {
  return (
    <div 
      {...props}
      className={cn(
        "bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}
