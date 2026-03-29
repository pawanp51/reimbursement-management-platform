import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
        rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        category: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
