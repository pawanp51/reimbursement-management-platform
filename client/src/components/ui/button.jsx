import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white/80 text-slate-900 hover:bg-white dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
        approve:
          'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.45)] focus-visible:ring-emerald-400',
        reject:
          'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white shadow-[0_8px_20px_rgba(244,63,94,0.35)] hover:shadow-[0_10px_24px_rgba(244,63,94,0.45)] focus-visible:ring-rose-400',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-slate-700/50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

Button.displayName = 'Button';

export { Button };
