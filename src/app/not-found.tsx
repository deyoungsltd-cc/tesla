export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '5rem', fontWeight: 'bold', color: '#CC0000', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Page Not Found</h1>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#CC0000', color: '#fff', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
          Go to Homepage
        </a>
      </div>
    </div>
  );
}
