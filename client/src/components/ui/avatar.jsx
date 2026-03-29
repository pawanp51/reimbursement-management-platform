import { cn } from '../../lib/utils';

export function Avatar({ name, src, className }) {
  const fallback = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return <img src={src} alt={`${name} avatar`} className={cn('h-9 w-9 rounded-full object-cover', className)} />;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xs font-semibold text-white',
        className,
      )}
    >
      {fallback}
    </div>
  );
}
