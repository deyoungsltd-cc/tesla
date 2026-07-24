export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tesla T Emblem */}
      <div style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }}>
        <svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.743 0L7.79 12.276h3.166l.546-1.397h5.506l.546 1.397h3.166L15.257 0h-2.514zM12 4.583l1.835 4.744h-3.67L12 4.583zM7.79 12.276L.1 24h23.8l-7.69-11.724H7.79z" fill="#CC0000"/>
        </svg>
      </div>
      {/* Spinning ring */}
      <div style={{ width: 32, height: 32, border: '2px solid #333', borderTopColor: '#CC0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px rgba(204,0,0,0.3)); }
          50% { opacity: 0.7; filter: drop-shadow(0 0 12px rgba(204,0,0,0.6)); }
        }
      `}</style>
      <p style={{ color: '#666', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Loading Tesla Prime...</p>
    </div>
  );
}
