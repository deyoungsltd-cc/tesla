'use client';

import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-slide-in ${
            t.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-tesla-card border border-tesla-border text-white'
          }`}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && <div className="text-gray-300 text-xs mt-0.5">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}