import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      expand
      toastOptions={{
        className:
          'border border-white/20 bg-white/90 text-slate-900 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100',
      }}
    />
  );
}
