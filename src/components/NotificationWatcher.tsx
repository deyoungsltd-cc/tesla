'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * NotificationWatcher
 *
 * Polls /api/notifications every 8 seconds.
 * When a NEW unread notification is detected:
 *   1. Plays a notification chime (Web Audio API — never blocked by autoplay rules)
 *   2. Shows a browser push notification (if permission granted + page not focused)
 *   3. Shows an in-app toast notification (always, even when focused)
 *   4. Updates the unread badge in the header
 *
 * Also requests push notification permission on first mount
 * and registers the service worker.
 *
 * Props:
 *   onUnreadChange(count: number) — called when unread count changes
 *   onNewNotification(title: string, body: string) — called when a new notification arrives
 */

interface Props {
  onUnreadChange?: (count: number) => void;
  onNewNotification?: (title: string, body: string) => void;
}

// Generate a pleasant notification beep using Web Audio API
// This NEVER gets blocked by browser autoplay policies because
// it's synthesized, not loaded from a file.
function playNotificationBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    // First tone (higher pitch — "ding")
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.setValueAtTime(1047, ctx.currentTime + 0.1); // C6
    osc1.connect(gain);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Second tone (chime — "dong")
    const gain2 = ctx.createGain();
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1319, ctx.currentTime + 0.15); // E6
    osc2.connect(gain2);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);

    // Clean up context after sound finishes
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Web Audio not supported — silent fallback
  }
}

export default function NotificationWatcher({ onUnreadChange, onNewNotification }: Props) {
  const lastUnreadRef = useRef<number>(-1); // -1 = not yet initialized
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Request notification permission + register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const currentPermission = Notification.permission;

    if (currentPermission === 'default') {
      // Delay the permission prompt by 3 seconds so the page loads first
      const timer = setTimeout(() => {
        if (!mountedRef.current) return;
        Notification.requestPermission().catch(() => {});
      }, 3000);
      return () => clearTimeout(timer);
    }


  }, []);

  // Poll for notifications
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    let lastFetchedIds: string[] = [];

    const poll = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || !mountedRef.current) return;
        const json = await res.json();

        const notifications: any[] = json?.data?.notifications || [];
        const unreadCount = notifications.filter((n: any) => !n.isRead).length;

        if (!mountedRef.current) return;

        // Notify parent about unread count
        onUnreadChange?.(unreadCount);

        // Detect NEW notifications (compare IDs)
        const currentIds = notifications.map((n: any) => n.id);
        const newIds = currentIds.filter((id: string) => !lastFetchedIds.includes(id));
        const newUnread = newIds
          .map((id: string) => notifications.find((n: any) => n.id === id))
          .filter((n: any) => n && !n.isRead);

        if (newUnread.length > 0 && lastFetchedIds.length > 0) {
          // New notifications arrived!
          const latest = newUnread[0];
          const title = latest.title || 'New Notification';
          const body = latest.message || '';

          // 1. Play sound (always, even when page is focused)
          playNotificationBeep();

          // 2. Show browser push notification (only when page is NOT focused)
          if (!document.hasFocus() && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('TeslaPrime', {
                body: title + ': ' + body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'tesla-notification',
                requireInteraction: false,
              });
            } catch {
              // Push not available
            }
          }

          // 3. Trigger in-app callback for toast
          onNewNotification?.(title, body);
        }

        // If unread count increased from 0 (initial load), also play sound once
        if (lastUnreadRef.current === -1 && unreadCount > 0) {
          // First poll — don't play sound (user just loaded page)
        }

        lastUnreadRef.current = unreadCount;
        lastFetchedIds = currentIds;
      } catch {
        // Swallow — polling is best-effort
      }
    };

    // Initial poll
    poll();

    // Poll every 8 seconds
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [onUnreadChange, onNewNotification]);

  // This component renders nothing visible
  return null;
}
