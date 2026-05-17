import {ComponentPropsWithoutRef} from 'react';
import { cn } from '../../lib/utils';

type CardProps = ComponentPropsWithoutRef<'div'>;

export function Card({children, className, ...props}: CardProps) {
  return (
    <div 
      {...props}
      className={cn(
        "overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
