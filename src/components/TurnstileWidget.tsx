'use client';

import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
    onTurnstileLoad: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  size?: 'normal' | 'compact';
  className?: string;
}

export default function TurnstileWidget({ onToken, onExpire, onError, size = 'normal', className = '' }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useCallback((token: string) => { onToken(token); }, [onToken]);
  const expireRef = useCallback(() => { onExpire?.(); }, [onExpire]);
  const errorRef = useCallback(() => { onError?.(); }, [onError]);

  useEffect(() => {
    // If no site key configured, skip rendering entirely
    if (!SITE_KEY) return;

    // If turnstile already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Otherwise, load the script
    window.onTurnstileLoad = () => {
      renderWidget();
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderWidget() {
    if (!containerRef.current || !window.turnstile) return;

    // Remove previous widget if exists
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch {}
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY!,
      callback: tokenRef,
      'expired-callback': expireRef,
      'error-callback': errorRef,
      size,
      theme: 'dark',
    });
  }

  // If no site key, render nothing (graceful degradation)
  if (!SITE_KEY) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
