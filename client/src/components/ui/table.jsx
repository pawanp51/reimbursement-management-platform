import { cn } from '../../lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-slate-200/70 dark:border-slate-700/70">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('sticky top-0 z-20 bg-white/65 backdrop-blur-xl dark:bg-slate-900/65', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-slate-200/60 transition-colors duration-300 even:bg-white/35 odd:bg-white/20 hover:bg-sky-100/60 dark:border-slate-700/60 dark:even:bg-slate-900/35 dark:odd:bg-slate-900/20 dark:hover:bg-sky-500/10',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return <td className={cn('p-4 align-middle', className)} {...props} />;
}
