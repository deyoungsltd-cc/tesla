'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#0a0a0f', color: '#fff', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚡</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#CC0000' }}>Something went wrong</h1>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{ background: '#CC0000', color: '#fff', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
              >
                Try Again
              </button>
              <a href="/" style={{ border: '1px solid #333', color: '#ccc', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
