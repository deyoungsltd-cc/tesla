'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('token');
      document.cookie = 'adminToken=; path=/; max-age=0';
      document.cookie = 'token=; path=/; max-age=0';
    } catch {}
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: '#0a0a0f', color: '#fff', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>&#9889;</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#CC0000' }}>Something went wrong</h1>
            <p style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.875rem' }}>
              An unexpected error occurred.
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              color: '#f87171',
              wordBreak: 'break-all',
              maxHeight: '200px',
              overflow: 'auto',
            }}>
              <div style={{ color: '#9ca3af', marginBottom: '0.25rem', fontSize: '0.625rem' }}>Error details:</div>
              <div>{error?.message || 'Unknown error'}</div>
              {error?.digest && <div style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.625rem' }}>Digest: {error.digest}</div>}
              {error?.stack && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ color: '#9ca3af', cursor: 'pointer', fontSize: '0.625rem' }}>Stack trace</summary>
                  <pre style={{ fontSize: '0.6rem', color: '#6b7280', whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>{error.stack}</pre>
                </details>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('token');
                    document.cookie = 'adminToken=; path=/; max-age=0';
                    document.cookie = 'token=; path=/; max-age=0';
                  } catch {}
                  reset();
                }}
                style={{ background: '#CC0000', color: '#fff', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
              >
                Clear Data &amp; Try Again
              </button>
              <a href="/admin/login" style={{ border: '1px solid #333', color: '#ccc', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
