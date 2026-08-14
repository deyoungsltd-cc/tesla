'use client';

export default function AdminLoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-tesla-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-white mb-2">Login Error</h1>
        <p className="text-gray-400 text-sm mb-4">{error?.message || 'Something went wrong loading the login page.'}</p>
        <button
          onClick={() => { localStorage.clear(); document.cookie = 'adminToken=; path=/; max-age=0'; reset(); }}
          className="bg-[#CC0000] text-white px-6 py-2 rounded-xl text-sm font-bold"
        >
          Clear Data & Retry
        </button>
        <div className="mt-4">
          <a href="/admin/login" className="text-gray-500 text-xs hover:text-gray-300">
            Refresh login page
          </a>
        </div>
      </div>
    </div>
  );
}
