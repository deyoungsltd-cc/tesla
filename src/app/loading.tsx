export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tesla T Emblem */}
      <div style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }}>
        <svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362h-.004.004zm0-3.899c3.415-.03 7.326.528 11.328 2.28.535-.968.672-1.395.672-1.395C19.625.612 15.528.015 12 0 8.472.015 4.375.61 0 2.349c0 0 .195.525.672 1.396C4.674 1.989 8.585 1.435 12 1.46V1.463z" fill="#CC0000"/>
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
